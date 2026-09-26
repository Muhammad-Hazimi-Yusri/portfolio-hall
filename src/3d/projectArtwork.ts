import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import type { Scene } from '@babylonjs/core/scene'
import type { POIContent } from '@/types/poi'

function wrapped(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number, maxLines: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const next = `${line} ${word}`.trim()
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = word } else line = next
  }
  if (line) lines.push(line)
  lines.slice(0, maxLines).forEach((value, index) => {
    const clipped = index === maxLines - 1 && lines.length > maxLines ? `${value.replace(/\s+\S+$/, '')}…` : value
    ctx.fillText(clipped, x, y + index * lineHeight)
  })
}

export function createProjectArtwork(id: string, content: POIContent, scene: Scene) {
  const texture = new DynamicTexture(`${id}-exhibit-artwork`, { width: 1024, height: 682 }, scene, true)
  texture.anisotropicFilteringLevel = 4
  const ctx = texture.getContext() as unknown as CanvasRenderingContext2D
  const paint = (image?: HTMLImageElement) => {
    ctx.textAlign = 'left'
    ctx.fillStyle = '#f3f0e6'; ctx.fillRect(0, 0, 1024, 682)
    if (image) {
      // The work occupies the frame. Its title already has a physical plaque;
      // repeating a large heading here reduced every image to a thumbnail.
      const area = { x: 24, y: 24, width: 976, height: 558 }
      ctx.fillStyle = '#273d35'; ctx.fillRect(area.x, area.y, area.width, area.height)
      const scale = Math.min(area.width / image.naturalWidth, area.height / image.naturalHeight)
      const width = image.naturalWidth * scale, height = image.naturalHeight * scale
      ctx.drawImage(image, area.x + (area.width - width) / 2, area.y + (area.height - height) / 2, width, height)
      ctx.fillStyle = '#344b40'; ctx.font = '22px sans-serif'
      wrapped(ctx, content.imageCaption ?? content.title, 32, 621, 960, 28, 2)
    } else {
      ctx.fillStyle = '#6d7464'; ctx.font = '19px sans-serif'
      ctx.fillText((content.category ?? 'Project notes').toUpperCase(), 52, 55)
      ctx.fillStyle = '#243a30'; ctx.font = '500 49px sans-serif'
      wrapped(ctx, content.title, 48, 129, 928, 56, 2)
      ctx.fillStyle = '#4d5f50'; ctx.font = '28px sans-serif'
      wrapped(ctx, content.storyHook ?? content.description, 52, 266, 896, 39, 3)
      const steps = content.exhibitSteps?.slice(0, 3)
      if (steps?.length) {
        ctx.fillStyle = '#7a6852'; ctx.font = '17px sans-serif'; ctx.fillText('WORKFLOW', 52, 409)
        ctx.strokeStyle = '#c4c4b4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(67, 449); ctx.lineTo(710, 449); ctx.stroke()
        steps.forEach((step, index) => {
          const x = 52 + index * 322
          ctx.fillStyle = '#f3f0e6'; ctx.fillRect(x, 434, 36, 30)
          ctx.fillStyle = '#98694b'; ctx.font = '21px monospace'; ctx.fillText(String(index + 1).padStart(2, '0'), x, 456)
          ctx.fillStyle = '#344b40'; ctx.font = '500 25px sans-serif'
          wrapped(ctx, step, x, 499, 290, 33, 2)
        })
      }
      ctx.strokeStyle = '#c4c4b4'; ctx.beginPath(); ctx.moveTo(52, 594); ctx.lineTo(972, 594); ctx.stroke()
      ctx.fillStyle = '#6d7464'; ctx.font = '19px sans-serif'
      ctx.fillText(content.status ?? 'Project notes', 52, 641)
      ctx.textAlign = 'right'
      ctx.fillText((content.tags ?? []).slice(0, 2).join(' / '), 972, 641)
    }
    texture.update()
    scene.metadata ??= {}
    scene.metadata.needsRender = true
  }
  paint()
  if (content.thumbnail) {
    const image = new Image()
    image.onload = () => { if (!scene.isDisposed) paint(image) }
    image.src = content.thumbnail
    scene.onDisposeObservable.addOnce(() => { image.onload = null; image.onerror = null })
  }
  texture.uScale = -1; texture.uOffset = 1
  return texture
}
