import type {
  DynamicExperimentSpec,
} from './types.js'

const HYPERCUBE_DOCUMENT = `
<style>
  .hypercube-stage{position:relative;height:100%;min-height:520px;overflow:hidden;border-radius:14px;background:radial-gradient(circle at 50% 44%,#f5f3ff 0,#eef2ff 38%,#f8fafc 76%)}
  .hypercube-stage canvas{display:block;width:100%;height:520px}
  .hypercube-info{position:absolute;left:18px;top:16px;padding:9px 13px;border:1px solid rgba(99,102,241,.18);border-radius:10px;background:rgba(255,255,255,.88);box-shadow:0 8px 24px rgba(99,102,241,.1);font-size:13px;font-weight:700;color:#4338ca;backdrop-filter:blur(8px)}
  .hypercube-legend{position:absolute;right:18px;bottom:16px;display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.86);font-size:12px;color:#64748b}
  .hypercube-legend span{display:inline-block;width:22px;height:3px;border-radius:999px;background:linear-gradient(90deg,#2563eb,#a855f7,#ec4899)}
</style>
<div class="hypercube-stage">
  <canvas id="hypercube-canvas" aria-label="高维超立方体的三维投影"></canvas>
  <div id="hypercube-info" class="hypercube-info">4D 超立方体</div>
  <div class="hypercube-legend"><span></span>颜色区分不同坐标方向的边</div>
</div>
<script>
(function () {
  var canvas = document.getElementById('hypercube-canvas');
  var info = document.getElementById('hypercube-info');
  var context = canvas.getContext('2d');
  var state = { dimension: 4, rotation: 28, perspective: 4.2 };

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function createVertices(dimension) {
    var count = Math.pow(2, dimension);
    var vertices = [];
    for (var index = 0; index < count; index += 1) {
      var point = [];
      for (var axis = 0; axis < dimension; axis += 1) {
        point.push((index & (1 << axis)) === 0 ? -1 : 1);
      }
      vertices.push(point);
    }
    return vertices;
  }

  function rotatePoint(source, dimension, angle) {
    var point = source.slice();
    for (var first = 0; first < dimension; first += 1) {
      for (var second = first + 1; second < dimension; second += 1) {
        var localAngle = angle * (0.18 + ((first + second) % 5) * 0.065);
        var cosine = Math.cos(localAngle);
        var sine = Math.sin(localAngle);
        var a = point[first];
        var b = point[second];
        point[first] = a * cosine - b * sine;
        point[second] = a * sine + b * cosine;
      }
    }
    return point;
  }

  function projectPoint(source, dimension, perspective) {
    var point = source.slice();
    for (var axis = dimension - 1; axis >= 3; axis -= 1) {
      var denominator = Math.max(0.75, perspective - point[axis] * 0.55);
      var factor = perspective / denominator;
      for (var coordinate = 0; coordinate < axis; coordinate += 1) {
        point[coordinate] *= factor;
      }
    }
    var cameraDistance = 5;
    var cameraFactor = cameraDistance / Math.max(1.2, cameraDistance - point[2] * 0.42);
    return {
      x: point[0] * cameraFactor,
      y: point[1] * cameraFactor,
      depth: point[2]
    };
  }

  function render() {
    var rectangle = canvas.getBoundingClientRect();
    var ratio = Math.min(2, window.devicePixelRatio || 1);
    var width = Math.max(320, rectangle.width);
    var height = Math.max(360, rectangle.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    var dimension = clamp(Math.round(Number(state.dimension) || 4), 3, 6);
    var rotation = (Number(state.rotation) || 0) * Math.PI / 180;
    var perspective = clamp(Number(state.perspective) || 4.2, 3, 8);
    var vertices = createVertices(dimension);
    var projected = vertices.map(function (vertex) {
      return projectPoint(rotatePoint(vertex, dimension, rotation), dimension, perspective);
    });
    var centerX = width / 2;
    var centerY = height / 2 + 8;
    var scale = Math.min(width, height) * (dimension >= 6 ? 0.115 : dimension === 5 ? 0.135 : 0.17);
    var edges = [];

    for (var index = 0; index < vertices.length; index += 1) {
      for (var axis = 0; axis < dimension; axis += 1) {
        var target = index ^ (1 << axis);
        if (index < target) {
          edges.push({
            from: index,
            to: target,
            axis: axis,
            depth: (projected[index].depth + projected[target].depth) / 2
          });
        }
      }
    }

    edges.sort(function (left, right) { return left.depth - right.depth; });
    context.lineCap = 'round';
    edges.forEach(function (edge) {
      var from = projected[edge.from];
      var to = projected[edge.to];
      var alpha = clamp(0.42 + (edge.depth + 2) * 0.12, 0.3, 0.92);
      var hue = 218 + edge.axis * 28;
      context.beginPath();
      context.moveTo(centerX + from.x * scale, centerY - from.y * scale);
      context.lineTo(centerX + to.x * scale, centerY - to.y * scale);
      context.strokeStyle = 'hsla(' + hue + ',82%,57%,' + alpha + ')';
      context.lineWidth = 1.5 + alpha * 1.7;
      context.stroke();
    });

    projected.forEach(function (point) {
      var radius = clamp(3.2 + point.depth * 0.45, 2.4, 5.2);
      context.beginPath();
      context.arc(centerX + point.x * scale, centerY - point.y * scale, radius, 0, Math.PI * 2);
      context.fillStyle = point.depth > 0 ? '#7c3aed' : '#2563eb';
      context.fill();
      context.strokeStyle = 'rgba(255,255,255,.9)';
      context.lineWidth = 1.2;
      context.stroke();
    });

    info.textContent = dimension + 'D 超立方体 · ' + vertices.length + ' 个顶点 · ' + edges.length + ' 条边';
  }

  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'mathviz:parameters') return;
    state = Object.assign({}, state, event.data.parameters || {});
    render();
  });
  window.addEventListener('resize', render);
  render();
})();
</script>`

function createHypercubeExperiment(): DynamicExperimentSpec {
  return {
    version: 1,
    title: '高维超立方体投影',
    description:
      '通过旋转和逐维透视投影，观察四维及更高维超立方体在二维屏幕上的线框结构。',
    gradeLevel: '高中 / 大学',
    formulaLatex:
      'V=\\{-1,1\\}^{n},\\quad |V|=2^n,\\quad |E|=n2^{n-1}',
    parameters: [
      {
        id: 'dimension',
        label: '空间维数 n',
        min: 3,
        max: 6,
        step: 1,
        defaultValue: 4,
        unit: '维',
      },
      {
        id: 'rotation',
        label: '旋转角度',
        min: 0,
        max: 360,
        step: 5,
        defaultValue: 28,
        unit: '°',
      },
      {
        id: 'perspective',
        label: '投影距离',
        min: 3,
        max: 8,
        step: 0.1,
        defaultValue: 4.2,
        unit: '',
      },
    ],
    renderer: {
      type: 'sandboxed-html',
      document: HYPERCUBE_DOCUMENT,
      height: 560,
    },
    steps: [
      {
        title: '观察四维结构',
        description:
          '先观察 4 维超立方体投影，识别 16 个顶点和 32 条边。',
        parameterValues: {
          dimension: 4,
          rotation: 28,
          perspective: 4.2,
        },
      },
      {
        title: '与三维立方体比较',
        description:
          '切换回 3 维，比较顶点数和边数，理解增加一个坐标方向带来的结构变化。',
        parameterValues: {
          dimension: 3,
          rotation: 20,
          perspective: 5,
        },
      },
      {
        title: '旋转观察投影',
        description:
          '改变旋转角度，区分投影中的交叉与高维空间里真正相连的边。',
        parameterValues: {
          dimension: 4,
          rotation: 115,
          perspective: 4.2,
        },
      },
      {
        title: '比较更高维结构',
        description:
          '继续增加维数，观察顶点和边的数量按照指数与线性乘积快速增长。',
        parameterValues: {
          dimension: 5,
          rotation: 145,
          perspective: 5.2,
        },
      },
    ],
    knowledgePoints: [
      'n 维超立方体的顶点可以表示为每个坐标均取 -1 或 1 的所有组合。',
      'n 维超立方体共有 2^n 个顶点，每个顶点与 n 个顶点相邻。',
      '每条边连接两个仅有一个坐标不同的顶点，因此边数为 n·2^(n-1)。',
      '屏幕中的线段交叉不代表高维空间中的边真实相交，它可能只是投影重叠。',
    ],
  }
}

export function createKnownDynamicExperiment(
  question: string,
): DynamicExperimentSpec | null {
  const normalizedQuestion = question
    .replace(/\s+/g, '')
    .replace(/[。！？!?]/g, '')

  if (
    /(?:四维|高维)?超立方体|四维立方体|tesseract/i.test(
      question,
    ) ||
    /^(?:请)?(?:生成|画|绘制|展示)(?:一个|一张)?(?:四维|4d|高维)(?:图像|图形|可视化)$/i.test(
      normalizedQuestion,
    )
  ) {
    return createHypercubeExperiment()
  }

  return null
}
