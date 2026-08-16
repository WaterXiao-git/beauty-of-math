export async function captureVisibleScreen() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    window.print()
    return
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  })

  try {
    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true
    await video.play()

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) throw new Error('浏览器无法创建截图画布')

    context.drawImage(video, 0, 0)

    const link = document.createElement('a')
    link.download = `数韵之美-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    stream.getTracks().forEach((track) => track.stop())
  }
}

export async function toggleDocumentFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen()
    return
  }

  await document.documentElement.requestFullscreen()
}
