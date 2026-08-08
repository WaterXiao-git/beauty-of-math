# Experiment V2 Quality Report

Generated: 2026-08-08T16:21:32.501Z

## Summary

- Total experiments: 300
- Native V2: 257
- Compatibility: 43
- Fully clean: 257
- High risk: 0
- Medium risk: 43
- Low risk: 0
- Total issues: 88

## PlayerBar

- ExperimentShell default player: false
- Explicit player: 0
- Shell default player: 0
- Disabled player: 0
- Missing player: 257

## Categories

| Category | Count |
| --- | ---: |
| dark-experiment-surface | 0 |
| legacy-three-column-grid | 41 |
| missing-playerbar | 0 |
| fixed-dimensions | 0 |
| canvas-overflow-risk | 0 |
| plotly-theme-mismatch | 0 |
| legacy-blue-button | 4 |
| missing-responsive-layout | 0 |
| compatibility-runtime | 43 |
| native-v2-without-shell | 0 |
| shell-without-v2-flag | 0 |

## Renderer

| Renderer | Total | With issues |
| --- | ---: | ---: |
| canvas | 261 | 15 |
| plotly | 33 | 22 |
| hybrid | 6 | 6 |

## Experiments

### bezier

- File: `src/experiments/bezier/BezierExperiment.tsx`
- Renderer: hybrid
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 10

- **compatibility-runtime** (medium)
  - L28: `export default function BezierExperiment() {`
- **legacy-three-column-grid** (medium)
  - L313: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L314: `<div className="lg:col-span-2 space-y-6">`
- **legacy-blue-button** (low)
  - L337: `<button`

### interpolation

- File: `src/experiments/interpolation/InterpolationExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 10

- **compatibility-runtime** (medium)
  - L11: `export default function InterpolationExperiment() {`
- **legacy-three-column-grid** (medium)
  - L346: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L347: `<div className="lg:col-span-2 space-y-6">`
- **legacy-blue-button** (low)
  - L535: `<button`

### regression

- File: `src/experiments/regression/RegressionExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 10

- **compatibility-runtime** (medium)
  - L11: `export default function RegressionExperiment() {`
- **legacy-three-column-grid** (medium)
  - L342: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L343: `<div className="lg:col-span-2 space-y-6">`
- **legacy-blue-button** (low)
  - L464: `<button`

### set-theory

- File: `src/experiments/set-theory/SetTheoryExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 10

- **compatibility-runtime** (medium)
  - L10: `export default function SetTheoryExperiment() {`
- **legacy-three-column-grid** (medium)
  - L265: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L266: `<div className="lg:col-span-2 space-y-6">`
- **legacy-blue-button** (low)
  - L363: `<button`

### basic-arithmetic

- File: `src/experiments/basic-arithmetic/BasicArithmeticExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L22: `export default function BasicArithmeticExperiment() {`
- **legacy-three-column-grid** (medium)
  - L463: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L464: `<div className="lg:col-span-2 space-y-6">`

### bayes

- File: `src/experiments/bayes/BayesExperiment.tsx`
- Renderer: hybrid
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L48: `export default function BayesExperiment() {`
- **legacy-three-column-grid** (medium)
  - L174: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L175: `<div className="lg:col-span-2 space-y-6">`

### calculus

- File: `src/experiments/calculus/CalculusExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L21: `export default function CalculusExperiment() {`
- **legacy-three-column-grid** (medium)
  - L162: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">`
  - L163: `<div className="lg:col-span-2 space-y-4 md:space-y-6">`

### chaos

- File: `src/experiments/chaos/ChaosExperiment.tsx`
- Renderer: hybrid
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L11: `export default function ChaosExperiment() {`
- **legacy-three-column-grid** (medium)
  - L225: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L226: `<div className="lg:col-span-2 space-y-6">`

### conic-sections

- File: `src/experiments/conic-sections/ConicSectionsExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L48: `export default function ConicSectionsExperiment() {`
- **legacy-three-column-grid** (medium)
  - L469: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L470: `<div className="lg:col-span-2 space-y-6">`

### cryptography

- File: `src/experiments/cryptography/CryptographyExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L11: `export default function CryptographyExperiment() {`
- **legacy-three-column-grid** (medium)
  - L266: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L267: `<div className="lg:col-span-2 space-y-6">`

### differential-geometry

- File: `src/experiments/differential-geometry/DifferentialGeometryExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L12: `export default function DifferentialGeometryExperiment() {`
- **legacy-three-column-grid** (medium)
  - L259: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L260: `<div className="lg:col-span-2 space-y-6">`

### fourier-drawing

- File: `src/experiments/fourier-drawing/FourierDrawingExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L79: `export default function FourierDrawingExperiment() {`
- **legacy-three-column-grid** (medium)
  - L257: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L258: `<div className="lg:col-span-2 space-y-6">`

### fourier-series

- File: `src/experiments/fourier-series/FourierSeriesExperiment.tsx`
- Renderer: hybrid
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L11: `export default function FourierSeriesExperiment() {`
- **legacy-three-column-grid** (medium)
  - L288: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L289: `<div className="lg:col-span-2 space-y-6">`

### fractal

- File: `src/experiments/fractal/FractalExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L10: `export default function FractalExperiment() {`
- **legacy-three-column-grid** (medium)
  - L201: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L202: `<div className="lg:col-span-2 space-y-6">`

### fractions

- File: `src/experiments/fractions/FractionsExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L30: `export default function FractionsExperiment() {`
- **legacy-three-column-grid** (medium)
  - L386: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L387: `<div className="lg:col-span-2 space-y-6">`

### game-theory

- File: `src/experiments/game-theory/GameTheoryExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L51: `export default function GameTheoryExperiment() {`
- **legacy-three-column-grid** (medium)
  - L270: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L271: `<div className="lg:col-span-2 space-y-6">`

### geometry-shapes

- File: `src/experiments/geometry-shapes/GeometryShapesExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L83: `export default function GeometryShapesExperiment() {`
- **legacy-three-column-grid** (medium)
  - L505: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L506: `<div className="lg:col-span-2 space-y-6">`

### gradient-descent

- File: `src/experiments/gradient-descent/GradientDescentExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L77: `export default function GradientDescentExperiment() {`
- **legacy-three-column-grid** (medium)
  - L203: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L204: `<div className="lg:col-span-2 space-y-6">`

### graph-theory

- File: `src/experiments/graph-theory/GraphTheoryExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L82: `export default function GraphTheoryExperiment() {`
- **legacy-three-column-grid** (medium)
  - L370: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L371: `<div className="lg:col-span-2 space-y-6">`

### heat-equation

- File: `src/experiments/heat-equation/HeatEquationExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L12: `export default function HeatEquationExperiment() {`
- **legacy-three-column-grid** (medium)
  - L229: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L230: `<div className="lg:col-span-2 space-y-6">`

### laplace

- File: `src/experiments/laplace/LaplaceExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L70: `export default function LaplaceExperiment() {`
- **legacy-three-column-grid** (medium)
  - L204: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L205: `<div className="lg:col-span-2 space-y-6">`

### linear-function

- File: `src/experiments/linear-function/LinearFunctionExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L14: `export default function LinearFunctionExperiment() {`
- **legacy-three-column-grid** (medium)
  - L303: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L304: `<div className="lg:col-span-2 space-y-6">`

### markov-chain

- File: `src/experiments/markov-chain/MarkovChainExperiment.tsx`
- Renderer: hybrid
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L56: `export default function MarkovChainExperiment() {`
- **legacy-three-column-grid** (medium)
  - L351: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L352: `<div className="lg:col-span-2 space-y-6">`

### matrix-decomposition

- File: `src/experiments/matrix-decomposition/MatrixDecompositionExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L11: `export default function MatrixDecompositionExperiment() {`
- **legacy-three-column-grid** (medium)
  - L218: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L219: `<div className="lg:col-span-2 space-y-6">`

### newton-method

- File: `src/experiments/newton-method/NewtonMethodExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L25: `export default function NewtonMethodExperiment() {`
- **legacy-three-column-grid** (medium)
  - L193: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L194: `<div className="lg:col-span-2 space-y-6">`

### number-theory

- File: `src/experiments/number-theory/NumberTheoryExperiment.tsx`
- Renderer: hybrid
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L11: `export default function NumberTheoryExperiment() {`
- **legacy-three-column-grid** (medium)
  - L209: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L210: `<div className="lg:col-span-2 space-y-6">`

### numerical-analysis

- File: `src/experiments/numerical-analysis/NumericalAnalysisExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L11: `export default function NumericalAnalysisExperiment() {`
- **legacy-three-column-grid** (medium)
  - L241: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L242: `<div className="lg:col-span-2 space-y-6">`

### numerical-integration

- File: `src/experiments/numerical-integration/NumericalIntegrationExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L54: `export default function NumericalIntegrationExperiment() {`
- **legacy-three-column-grid** (medium)
  - L324: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L325: `<div className="lg:col-span-2 space-y-6">`

### ode

- File: `src/experiments/ode/ODEExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L49: `export default function ODEExperiment() {`
- **legacy-three-column-grid** (medium)
  - L178: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L179: `<div className="lg:col-span-2 space-y-6">`

### optimization

- File: `src/experiments/optimization/OptimizationExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L63: `export default function OptimizationExperiment() {`
- **legacy-three-column-grid** (medium)
  - L245: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L246: `<div className="lg:col-span-2 space-y-6">`

### pca

- File: `src/experiments/pca/PCAExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L11: `export default function PCAExperiment() {`
- **legacy-three-column-grid** (medium)
  - L254: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L255: `<div className="lg:col-span-2 space-y-6">`

### pde

- File: `src/experiments/pde/PDEExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L12: `export default function PDEExperiment() {`
- **legacy-three-column-grid** (medium)
  - L312: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L313: `<div className="lg:col-span-2 space-y-6">`

### permutation-combination

- File: `src/experiments/permutation-combination/PermutationCombinationExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L48: `export default function PermutationCombinationExperiment() {`
- **legacy-three-column-grid** (medium)
  - L217: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L218: `<div className="lg:col-span-2 space-y-6">`

### probability

- File: `src/experiments/probability/ProbabilityExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L54: `export default function ProbabilityExperiment() {`
- **legacy-three-column-grid** (medium)
  - L213: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L214: `<div className="lg:col-span-2 space-y-6">`

### pythagorean

- File: `src/experiments/pythagorean/PythagoreanExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L16: `export default function PythagoreanExperiment() {`
- **legacy-three-column-grid** (medium)
  - L313: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L314: `<div className="lg:col-span-2 space-y-6">`

### quadratic-function

- File: `src/experiments/quadratic-function/QuadraticFunctionExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L14: `export default function QuadraticFunctionExperiment() {`
- **legacy-three-column-grid** (medium)
  - L335: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L336: `<div className="lg:col-span-2 space-y-6">`

### random-walk

- File: `src/experiments/random-walk/RandomWalkExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L11: `export default function RandomWalkExperiment() {`
- **legacy-three-column-grid** (medium)
  - L179: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L180: `<div className="lg:col-span-2 space-y-6">`

### signal-processing

- File: `src/experiments/signal-processing/SignalProcessingExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L12: `export default function SignalProcessingExperiment() {`
- **legacy-three-column-grid** (medium)
  - L264: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L265: `<div className="lg:col-span-2 space-y-6">`

### taylor

- File: `src/experiments/taylor/TaylorExperiment.tsx`
- Renderer: plotly
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L92: `export default function TaylorExperiment() {`
- **legacy-three-column-grid** (medium)
  - L208: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L209: `<div className="lg:col-span-2 space-y-6">`

### vector-field

- File: `src/experiments/vector-field/VectorFieldExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L60: `export default function VectorFieldExperiment() {`
- **legacy-three-column-grid** (medium)
  - L323: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L324: `<div className="lg:col-span-2 space-y-6">`

### wave-equation

- File: `src/experiments/wave-equation/WaveEquationExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 9

- **compatibility-runtime** (medium)
  - L10: `export default function WaveEquationExperiment() {`
- **legacy-three-column-grid** (medium)
  - L219: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
  - L220: `<div className="lg:col-span-2 space-y-6">`

### game-of-life

- File: `src/experiments/game-of-life/GameOfLifeExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 5

- **compatibility-runtime** (medium)
  - L14: `export default function GameOfLifeExperiment() {`

### three-body

- File: `src/experiments/three-body/ThreeBodyExperiment.tsx`
- Renderer: canvas
- Native V2: false
- Player: none
- Effective PlayerBar: false
- Risk: medium
- Score: 5

- **compatibility-runtime** (medium)
  - L14: `export default function ThreeBodyExperiment() {`

### a-star

- File: `src/experiments/a-star/AStarExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### absolute-value

- File: `src/experiments/absolute-value/AbsoluteValueExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### aliasing

- File: `src/experiments/aliasing/AliasingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### apollonian-gasket

- File: `src/experiments/apollonian-gasket/ApollonianGasketExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### arc-length-curvature

- File: `src/experiments/arc-length-curvature/ArcLengthCurvatureExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### autocorrelation

- File: `src/experiments/autocorrelation/AutocorrelationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### b-spline

- File: `src/experiments/b-spline/BSplineExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### backpropagation

- File: `src/experiments/backpropagation/BackpropagationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### barnsley-fern

- File: `src/experiments/barnsley-fern/BarnsleyFernExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### bell-numbers

- File: `src/experiments/bell-numbers/BellNumbersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### benfords-law

- File: `src/experiments/benfords-law/BenfordsLawExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### bessel-functions

- File: `src/experiments/bessel-functions/BesselFunctionsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### bfs-dfs

- File: `src/experiments/bfs-dfs/BfsDfsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### binomial-theorem

- File: `src/experiments/binomial-theorem/BinomialTheoremExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### birthday-paradox

- File: `src/experiments/birthday-paradox/BirthdayParadoxExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### bisection-method

- File: `src/experiments/bisection-method/BisectionMethodExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### box-counting-dimension

- File: `src/experiments/box-counting-dimension/BoxCountingDimensionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### brachistochrone

- File: `src/experiments/brachistochrone/BrachistochroneExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### brownian-motion

- File: `src/experiments/brownian-motion/BrownianMotionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### buffon-needle

- File: `src/experiments/buffon-needle/BuffonNeedleExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### burning-ship

- File: `src/experiments/burning-ship/BurningShipExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### caesar-cipher

- File: `src/experiments/caesar-cipher/CaesarCipherExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### cantor-set

- File: `src/experiments/cantor-set/CantorSetExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### catalan-numbers

- File: `src/experiments/catalan-numbers/CatalanNumbersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### catenary

- File: `src/experiments/catenary/CatenaryExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### catmull-rom

- File: `src/experiments/catmull-rom/CatmullRomExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### cellular-automata

- File: `src/experiments/cellular-automata/CellularAutomataExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### chebyshev-polynomials

- File: `src/experiments/chebyshev-polynomials/ChebyshevPolynomialsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### chinese-remainder

- File: `src/experiments/chinese-remainder/ChineseRemainderExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### cholesky

- File: `src/experiments/cholesky/CholeskyExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### circle-geometry

- File: `src/experiments/circle-geometry/CircleGeometryExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### circle-packing

- File: `src/experiments/circle-packing/CirclePackingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### clock-angles

- File: `src/experiments/clock-angles/ClockAnglesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### clt

- File: `src/experiments/clt/CLTExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### collatz

- File: `src/experiments/collatz/CollatzExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### combinatorial-proof

- File: `src/experiments/combinatorial-proof/CombinatorialProofExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### complex

- File: `src/experiments/complex/ComplexExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### composite-function

- File: `src/experiments/composite-function/CompositeFunctionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### confidence-interval

- File: `src/experiments/confidence-interval/ConfidenceIntervalExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### continued-fraction

- File: `src/experiments/continued-fraction/ContinuedFractionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### convex-hull

- File: `src/experiments/convex-hull/ConvexHullExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### convolution

- File: `src/experiments/convolution/ConvolutionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### coupon-collector

- File: `src/experiments/coupon-collector/CouponCollectorExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### cramers-rule

- File: `src/experiments/cramers-rule/CramersRuleExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### cycloid

- File: `src/experiments/cycloid/CycloidExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### damped-oscillation

- File: `src/experiments/damped-oscillation/DampedOscillationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### decision-tree

- File: `src/experiments/decision-tree/DecisionTreeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### delaunay-triangulation

- File: `src/experiments/delaunay-triangulation/DelaunayTriangulationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### derangements

- File: `src/experiments/derangements/DerangementsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### determinant-geometry

- File: `src/experiments/determinant-geometry/DeterminantGeometryExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### dice-probability

- File: `src/experiments/dice-probability/DiceProbabilityExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### diffie-hellman

- File: `src/experiments/diffie-hellman/DiffieHellmanExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### digital-root

- File: `src/experiments/digital-root/DigitalRootExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### dijkstra

- File: `src/experiments/dijkstra/DijkstraExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### directional-derivative

- File: `src/experiments/directional-derivative/DirectionalDerivativeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### discrete-cosine-transform

- File: `src/experiments/discrete-cosine-transform/DiscreteCosineTransformExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### divergence-curl

- File: `src/experiments/divergence-curl/DivergenceCurlExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### divide-conquer

- File: `src/experiments/divide-conquer/DivideConquerExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### dot-cross-product

- File: `src/experiments/dot-cross-product/DotCrossProductExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### double-pendulum

- File: `src/experiments/double-pendulum/DoublePendulumExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### dragon-curve

- File: `src/experiments/dragon-curve/DragonCurveExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### dynamic-programming

- File: `src/experiments/dynamic-programming/DynamicProgrammingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### ear-clipping

- File: `src/experiments/ear-clipping/EarClippingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### eigen-visualization

- File: `src/experiments/eigen-visualization/EigenVisualizationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### elliptic-curve

- File: `src/experiments/elliptic-curve/EllipticCurveExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### epidemic-sir

- File: `src/experiments/epidemic-sir/EpidemicSirExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### epsilon-delta

- File: `src/experiments/epsilon-delta/EpsilonDeltaExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### euclidean-algorithm

- File: `src/experiments/euclidean-algorithm/EuclideanAlgorithmExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### euler-characteristic

- File: `src/experiments/euler-characteristic/EulerCharacteristicExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### euler-hamilton-path

- File: `src/experiments/euler-hamilton-path/EulerHamiltonPathExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### euler-identity

- File: `src/experiments/euler-identity/EulerIdentityExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### euler-line

- File: `src/experiments/euler-line/EulerLineExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### euler-totient

- File: `src/experiments/euler-totient/EulerTotientExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### even-odd

- File: `src/experiments/even-odd/EvenOddExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### exponential-log

- File: `src/experiments/exponential-log/ExponentialLogExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### farey-sequence

- File: `src/experiments/farey-sequence/FareySequenceExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### fast-exponentiation

- File: `src/experiments/fast-exponentiation/FastExponentiationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### fermat-little

- File: `src/experiments/fermat-little/FermatLittleExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### fft

- File: `src/experiments/fft/FftExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### fibonacci-nature

- File: `src/experiments/fibonacci-nature/FibonacciNatureExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### fixed-point-iteration

- File: `src/experiments/fixed-point-iteration/FixedPointIterationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### fourier

- File: `src/experiments/fourier/FourierExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### frobenius-coin

- File: `src/experiments/frobenius-coin/FrobeniusCoinExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### function-transform

- File: `src/experiments/function-transform/FunctionTransformExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### galton-board

- File: `src/experiments/galton-board/GaltonBoardExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### gamblers-ruin

- File: `src/experiments/gamblers-ruin/GamblersRuinExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### gamma-function

- File: `src/experiments/gamma-function/GammaFunctionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### gaussian-integers

- File: `src/experiments/gaussian-integers/GaussianIntegersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### gaussian-mixture

- File: `src/experiments/gaussian-mixture/GaussianMixtureExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### gaussian-process

- File: `src/experiments/gaussian-process/GaussianProcessExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### generating-functions

- File: `src/experiments/generating-functions/GeneratingFunctionsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### genetic-algorithm

- File: `src/experiments/genetic-algorithm/GeneticAlgorithmExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### gibbs-phenomenon

- File: `src/experiments/gibbs-phenomenon/GibbsPhenomenonExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### golden-ratio

- File: `src/experiments/golden-ratio/GoldenRatioExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### gosper-curve

- File: `src/experiments/gosper-curve/GosperCurveExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### gram-schmidt

- File: `src/experiments/gram-schmidt/GramSchmidtExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### graph-coloring

- File: `src/experiments/graph-coloring/GraphColoringExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### gray-code

- File: `src/experiments/gray-code/GrayCodeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### green-theorem

- File: `src/experiments/green-theorem/GreenTheoremExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### happy-numbers

- File: `src/experiments/happy-numbers/HappyNumbersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### henon-map

- File: `src/experiments/henon-map/HenonMapExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### hidden-markov

- File: `src/experiments/hidden-markov/HiddenMarkovExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### hilbert-curve

- File: `src/experiments/hilbert-curve/HilbertCurveExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### hill-cipher

- File: `src/experiments/hill-cipher/HillCipherExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### hopf-fibration

- File: `src/experiments/hopf-fibration/HopfFibrationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### huffman-coding

- File: `src/experiments/huffman-coding/HuffmanCodingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### hyperbolic-tiling

- File: `src/experiments/hyperbolic-tiling/HyperbolicTilingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### hypothesis-testing

- File: `src/experiments/hypothesis-testing/HypothesisTestingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### improper-integral

- File: `src/experiments/improper-integral/ImproperIntegralExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### inclusion-exclusion

- File: `src/experiments/inclusion-exclusion/InclusionExclusionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### inequalities

- File: `src/experiments/inequalities/InequalitiesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### integer-partition

- File: `src/experiments/integer-partition/IntegerPartitionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### inverse-function

- File: `src/experiments/inverse-function/InverseFunctionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### inversive-geometry

- File: `src/experiments/inversive-geometry/InversiveGeometryExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### jacobian

- File: `src/experiments/jacobian/JacobianExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### josephus-problem

- File: `src/experiments/josephus-problem/JosephusProblemExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### kalman-filter

- File: `src/experiments/kalman-filter/KalmanFilterExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### kaprekar

- File: `src/experiments/kaprekar/KaprekarExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### kd-tree

- File: `src/experiments/kd-tree/KdTreeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### kepler-orbit

- File: `src/experiments/kepler-orbit/KeplerOrbitExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### kernel-image

- File: `src/experiments/kernel-image/KernelImageExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### kmeans

- File: `src/experiments/kmeans/KmeansExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### knn

- File: `src/experiments/knn/KnnExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### knot-theory

- File: `src/experiments/knot-theory/KnotTheoryExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### koch-snowflake

- File: `src/experiments/koch-snowflake/KochSnowflakeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### l-system

- File: `src/experiments/l-system/LSystemExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### lagrange-multiplier

- File: `src/experiments/lagrange-multiplier/LagrangeMultiplierExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### laplacian

- File: `src/experiments/laplacian/LaplacianExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### latin-square

- File: `src/experiments/latin-square/LatinSquareExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### law-large-numbers

- File: `src/experiments/law-large-numbers/LawLargeNumbersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### least-squares

- File: `src/experiments/least-squares/LeastSquaresExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### legendre-polynomials

- File: `src/experiments/legendre-polynomials/LegendrePolynomialsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### levy-c-curve

- File: `src/experiments/levy-c-curve/LevyCCurveExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### limit-cycle

- File: `src/experiments/limit-cycle/LimitCycleExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### line-clipping

- File: `src/experiments/line-clipping/LineClippingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### line-integral

- File: `src/experiments/line-integral/LineIntegralExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### linear-algebra

- File: `src/experiments/linear-algebra/LinearAlgebraExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### linear-system

- File: `src/experiments/linear-system/LinearSystemExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### lissajous

- File: `src/experiments/lissajous/LissajousExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### logarithm-spiral

- File: `src/experiments/logarithm-spiral/LogarithmSpiralExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### logistic-bifurcation

- File: `src/experiments/logistic-bifurcation/LogisticBifurcationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### logistic-regression

- File: `src/experiments/logistic-regression/LogisticRegressionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### look-and-say

- File: `src/experiments/look-and-say/LookAndSayExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### lorenz-attractor

- File: `src/experiments/lorenz-attractor/LorenzAttractorExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### lotka-volterra

- File: `src/experiments/lotka-volterra/LotkaVolterraExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### lu-decomposition

- File: `src/experiments/lu-decomposition/LuDecompositionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### lucas-numbers

- File: `src/experiments/lucas-numbers/LucasNumbersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### magic-square

- File: `src/experiments/magic-square/MagicSquareExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### mandelbrot-julia

- File: `src/experiments/mandelbrot-julia/MandelbrotJuliaExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### marching-squares

- File: `src/experiments/marching-squares/MarchingSquaresExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### markov-stationary

- File: `src/experiments/markov-stationary/MarkovStationaryExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### matrix-transform

- File: `src/experiments/matrix-transform/MatrixTransformExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### max-likelihood

- File: `src/experiments/max-likelihood/MaxLikelihoodExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### mean-value-theorem

- File: `src/experiments/mean-value-theorem/MeanValueTheoremExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### minimum-spanning-tree

- File: `src/experiments/minimum-spanning-tree/MinimumSpanningTreeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### mobius

- File: `src/experiments/mobius/MobiusExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### mobius-function

- File: `src/experiments/mobius-function/MobiusFunctionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### modular-arithmetic

- File: `src/experiments/modular-arithmetic/ModularArithmeticExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### monte-carlo

- File: `src/experiments/monte-carlo/MonteCarloExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### monty-hall

- File: `src/experiments/monty-hall/MontyHallExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### multiple-integral

- File: `src/experiments/multiple-integral/MultipleIntegralExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### naive-bayes

- File: `src/experiments/naive-bayes/NaiveBayesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### nbody-simulation

- File: `src/experiments/nbody-simulation/NbodySimulationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### network-flow

- File: `src/experiments/network-flow/NetworkFlowExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### neural-network-forward

- File: `src/experiments/neural-network-forward/NeuralNetworkForwardExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### newton-fractal

- File: `src/experiments/newton-fractal/NewtonFractalExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### nine-point-circle

- File: `src/experiments/nine-point-circle/NinePointCircleExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### number-bases

- File: `src/experiments/number-bases/NumberBasesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### nyquist-sampling

- File: `src/experiments/nyquist-sampling/NyquistSamplingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### one-time-pad

- File: `src/experiments/one-time-pad/OneTimePadExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### orthogonal-projection

- File: `src/experiments/orthogonal-projection/OrthogonalProjectionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### pagerank

- File: `src/experiments/pagerank/PagerankExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### parabola-optics

- File: `src/experiments/parabola-optics/ParabolaOpticsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### parametric

- File: `src/experiments/parametric/ParametricExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### partial-derivative

- File: `src/experiments/partial-derivative/PartialDerivativeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### partial-fractions

- File: `src/experiments/partial-fractions/PartialFractionsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### particle-swarm

- File: `src/experiments/particle-swarm/ParticleSwarmExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### pascal-triangle

- File: `src/experiments/pascal-triangle/PascalTriangleExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### peano-curve

- File: `src/experiments/peano-curve/PeanoCurveExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### pell-equation

- File: `src/experiments/pell-equation/PellEquationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### pendulum-phase

- File: `src/experiments/pendulum-phase/PendulumPhaseExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### perceptron

- File: `src/experiments/perceptron/PerceptronExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### percolation

- File: `src/experiments/percolation/PercolationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### perfect-numbers

- File: `src/experiments/perfect-numbers/PerfectNumbersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### phase-portrait

- File: `src/experiments/phase-portrait/PhasePortraitExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### pick-theorem

- File: `src/experiments/pick-theorem/PickTheoremExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### piecewise-function

- File: `src/experiments/piecewise-function/PiecewiseFunctionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### pigeonhole

- File: `src/experiments/pigeonhole/PigeonholeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### poincare-disk

- File: `src/experiments/poincare-disk/PoincareDiskExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### poincare-section

- File: `src/experiments/poincare-section/PoincareSectionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### point-in-polygon

- File: `src/experiments/point-in-polygon/PointInPolygonExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### poisson-process

- File: `src/experiments/poisson-process/PoissonProcessExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### polar

- File: `src/experiments/polar/PolarExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### polynomial-roots

- File: `src/experiments/polynomial-roots/PolynomialRootsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### power-iteration

- File: `src/experiments/power-iteration/PowerIterationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### power-series

- File: `src/experiments/power-series/PowerSeriesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### prime-counting

- File: `src/experiments/prime-counting/PrimeCountingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### prime-factorization

- File: `src/experiments/prime-factorization/PrimeFactorizationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### primitive-root

- File: `src/experiments/primitive-root/PrimitiveRootExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### projectile-motion

- File: `src/experiments/projectile-motion/ProjectileMotionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### pythagoras-tree

- File: `src/experiments/pythagoras-tree/PythagorasTreeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### pythagorean-triples

- File: `src/experiments/pythagorean-triples/PythagoreanTriplesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### qr-decomposition

- File: `src/experiments/qr-decomposition/QrDecompositionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### quadratic-form

- File: `src/experiments/quadratic-form/QuadraticFormExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### quadratic-residue

- File: `src/experiments/quadratic-residue/QuadraticResidueExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### quadtree

- File: `src/experiments/quadtree/QuadtreeExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### rational-asymptotes

- File: `src/experiments/rational-asymptotes/RationalAsymptotesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### reaction-diffusion

- File: `src/experiments/reaction-diffusion/ReactionDiffusionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### residue-theorem

- File: `src/experiments/residue-theorem/ResidueTheoremExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### reuleaux

- File: `src/experiments/reuleaux/ReuleauxExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### riemann-sum

- File: `src/experiments/riemann-sum/RiemannSumExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### roman-numerals

- File: `src/experiments/roman-numerals/RomanNumeralsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### rossler-attractor

- File: `src/experiments/rossler-attractor/RosslerAttractorExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### rotating-calipers

- File: `src/experiments/rotating-calipers/RotatingCalipersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### rotation3d

- File: `src/experiments/rotation3d/Rotation3dExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### rsa-cipher

- File: `src/experiments/rsa-cipher/RsaCipherExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### secant-method

- File: `src/experiments/secant-method/SecantMethodExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### sequences

- File: `src/experiments/sequences/SequencesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### series-convergence

- File: `src/experiments/series-convergence/SeriesConvergenceExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### sierpinski-carpet

- File: `src/experiments/sierpinski-carpet/SierpinskiCarpetExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### sierpinski-triangle

- File: `src/experiments/sierpinski-triangle/SierpinskiTriangleExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### sieve-eratosthenes

- File: `src/experiments/sieve-eratosthenes/SieveEratosthenesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### similar-triangles

- File: `src/experiments/similar-triangles/SimilarTrianglesExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### simulated-annealing

- File: `src/experiments/simulated-annealing/SimulatedAnnealingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### sine-superposition

- File: `src/experiments/sine-superposition/SineSuperpositionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### softmax

- File: `src/experiments/softmax/SoftmaxExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### solid-of-revolution

- File: `src/experiments/solid-of-revolution/SolidOfRevolutionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### sorting-algorithms

- File: `src/experiments/sorting-algorithms/SortingAlgorithmsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### spectral-theorem

- File: `src/experiments/spectral-theorem/SpectralTheoremExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### spherical-geometry

- File: `src/experiments/spherical-geometry/SphericalGeometryExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### spirograph

- File: `src/experiments/spirograph/SpirographExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### stats-basics

- File: `src/experiments/stats-basics/StatsBasicsExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### steiner-chain

- File: `src/experiments/steiner-chain/SteinerChainExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### stereographic-projection

- File: `src/experiments/stereographic-projection/StereographicProjectionExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### stern-brocot

- File: `src/experiments/stern-brocot/SternBrocotExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### stirling-numbers

- File: `src/experiments/stirling-numbers/StirlingNumbersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### stokes-theorem

- File: `src/experiments/stokes-theorem/StokesTheoremExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### sum-of-squares

- File: `src/experiments/sum-of-squares/SumOfSquaresExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### svd

- File: `src/experiments/svd/SvdExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### symmetry

- File: `src/experiments/symmetry/SymmetryExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### tangram

- File: `src/experiments/tangram/TangramExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### tent-map

- File: `src/experiments/tent-map/TentMapExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### tessellation

- File: `src/experiments/tessellation/TessellationExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### torus-klein

- File: `src/experiments/torus-klein/TorusKleinExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### tower-of-hanoi

- File: `src/experiments/tower-of-hanoi/TowerOfHanoiExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### triangle-centers

- File: `src/experiments/triangle-centers/TriangleCentersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### triangular-numbers

- File: `src/experiments/triangular-numbers/TriangularNumbersExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### trigonometry

- File: `src/experiments/trigonometry/TrigExperiment.tsx`
- Renderer: plotly
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### ulam-spiral

- File: `src/experiments/ulam-spiral/UlamSpiralExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### vector-calculus-field

- File: `src/experiments/vector-calculus-field/VectorCalculusFieldExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### vibrating-string

- File: `src/experiments/vibrating-string/VibratingStringExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### vieta-formulas

- File: `src/experiments/vieta-formulas/VietaFormulasExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### vigenere-cipher

- File: `src/experiments/vigenere-cipher/VigenereCipherExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### voronoi

- File: `src/experiments/voronoi/VoronoiExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### wavelet

- File: `src/experiments/wavelet/WaveletExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### wilson-theorem

- File: `src/experiments/wilson-theorem/WilsonTheoremExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.

### windowing

- File: `src/experiments/windowing/WindowingExperiment.tsx`
- Renderer: canvas
- Native V2: true
- Player: none
- Effective PlayerBar: false
- Risk: clean
- Score: 0

Clean.
