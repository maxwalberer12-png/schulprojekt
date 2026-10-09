/**
 * Automatische Weißwert-Maskierung via HTML5 Canvas (Client-seitig)
 * Entfernt weiße und sehr helle Hintergründe, damit Illustrationen
 * nahtlos und kantenlos auf dem Arbeitsblatt dargestellt werden können.
 */
export async function removeWhiteBackgroundCanvas(
  imageSrc: string,
  threshold = 244,
  feather = 18
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve(imageSrc)
        return
      }

      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imgData.data

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const minVal = Math.min(r, g, b)
        const maxVal = Math.max(r, g, b)
        const diff = maxVal - minVal

        if (minVal > threshold && diff < 20) {
          pixels[i + 3] = 0 // Vollständig transparent
        } else if (minVal > threshold - feather && diff < 16) {
          const factor = (threshold - minVal) / feather
          pixels[i + 3] = Math.round(pixels[i + 3] * Math.max(0, Math.min(1, factor)))
        }
      }

      ctx.putImageData(imgData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'))
    img.src = imageSrc
  })
}
