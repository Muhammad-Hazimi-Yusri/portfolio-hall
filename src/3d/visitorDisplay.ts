import type { Scene } from '@babylonjs/core/scene'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector4 } from '@babylonjs/core/Maths/math.vector'
import { visitPosition } from '@/data/community'
import type { Community } from '@/data/community'
import { countryFlagUrl } from '@/data/countryFlags'
import { createVisitorBoat, createVisitorBoatTarget } from './visitorBoat'
import { createGuestbookBoard } from './guestbookBoard'
import { createVisitorRidge } from './visitorRidge'
import type { WaterMaterial } from '@babylonjs/materials/water'

/** Static and bounded. Reuses cached water passes; no new pass or animation loop. */
export function createVisitorDisplay(scene: Scene) {
  let previous: Community | undefined
  let previousContent = ''
  let generation = 0
  let selectRidgeDay: (day: string | null) => void = () => {}
  let meshes: Mesh[] = [], materials: StandardMaterial[] = [], textures: DynamicTexture[] = []
  const clear = () => {
    generation++
    selectRidgeDay = () => {}
    scene.getMeshByName('contact-group')?.setEnabled(true)
    scene.metadata.guestbookActive = false
    const water = scene.getMaterialByName('waterMat') as WaterMaterial | null
    for (const target of [water?.reflectionTexture, water?.refractionTexture]) {
      if (target?.renderList) target.renderList = target.renderList.filter(mesh => !meshes.some(owned => owned === mesh))
    }
    scene.metadata.waterReflectionsDirty = true
    meshes.forEach(mesh => mesh.dispose())
    materials.forEach(material => material.dispose())
    textures.forEach(texture => texture.dispose())
    meshes = []; materials = []; textures = []
  }
  const material = (name: string, color: string) => {
    const result = new StandardMaterial(name, scene)
    result.diffuseColor = Color3.FromHexString(color)
    result.specularColor = Color3.Black()
    materials.push(result)
    return result
  }
  const finish = (mesh: Mesh, mat?: StandardMaterial, interactive = false) => {
    if (mat) mesh.material = mat
    mesh.layerMask = 0x0fffffff
    mesh.isPickable = interactive
    if (interactive) mesh.metadata = { portfolioRoute: '#contact' }
    mesh.freezeWorldMatrix(); meshes.push(mesh)
    return mesh
  }
  const batch = (pieces: Mesh[], mat: StandardMaterial, name: string, interactive = false) => {
    if (!pieces.length) return
    const mesh = Mesh.MergeMeshes(pieces, true, true, undefined, false, false)
    if (mesh) { mesh.name = name; mesh.checkCollisions = name === 'guestbook-board'; finish(mesh, mat, interactive) }
    return mesh
  }
  const update = (community: Community) => {
    if (previous === community) return
    previous = community
    // Polls return new objects even when the public log is unchanged. Preserve
    // the meshes, pending flag images and pick targets across those refreshes.
    const content = JSON.stringify(community)
    if (content === previousContent) return
    previousContent = content
    clear()
    scene.metadata.needsRender = true
    if (community.mode === 'offline') return
    const boats: Mesh[] = [], flags: Mesh[] = []
    if (community.visits.length) {
      const paint = material('visitor-painted-timber', '#ffffff')
      const atlas = new DynamicTexture('visitor-country-flags', { width: 512, height: 512 }, scene, true)
      atlas.anisotropicFilteringLevel = 4
      textures.push(atlas)
      const ctx = atlas.getContext() as unknown as CanvasRenderingContext2D
      ctx.fillStyle = '#ebe6cf'; ctx.fillRect(0, 0, 512, 512)
      ctx.fillStyle = '#334b49'; ctx.font = '600 54px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      const flagMaterial = material('visitor-flags', '#ffffff')
      // Geometry already supplies both sides, with their own outward normals.
      // Keep culling enabled so the reverse triangles are not drawn over the front.
      flagMaterial.diffuseTexture = atlas
      const flagRequests = new Map<string, number[]>()
      community.visits.slice(0, 12).forEach((visit, index) => {
        const col = index % 4, row = Math.floor(index / 4)
        ctx.fillText(visit.country === '??' ? '—' : visit.country, col * 128 + 64, row * 128 + 64)
        const tile = new Vector4((col * 128 + 4) / 512, 1 - (row * 128 + 124) / 512, (col * 128 + 124) / 512, 1 - (row * 128 + 4) / 512)
        const pose = visitPosition(visit, index)
        const boat = createVisitorBoat(scene, index, pose, tile)
        boats.push(...boat.solid); flags.push(boat.flag)
        meshes.push(createVisitorBoatTarget(scene, index, pose, visit))
        const url = countryFlagUrl(visit.country)
        if (url) flagRequests.set(url, [...(flagRequests.get(url) ?? []), index])
      })
      atlas.update()
      const hulls = batch(boats, paint, 'visitor-boats')
      const pennants = batch(flags, flagMaterial, 'visitor-flags')
      const water = scene.getMaterialByName('waterMat') as WaterMaterial | null
      for (const mesh of [hulls, pennants]) if (mesh) water?.addToRenderList(mesh)

      // Only self-hosted flags actually used by these visits are requested.
      // Late image callbacks cannot revive a cleared/replaced visitor display.
      const currentGeneration = generation
      void Promise.all([...flagRequests].map(([url, tiles]) => new Promise<void>(resolve => {
        const image = new Image()
        image.onload = () => {
          if (generation === currentGeneration && !scene.isDisposed) tiles.forEach(index => {
            ctx.drawImage(image, index % 4 * 128 + 4, Math.floor(index / 4) * 128 + 4, 120, 120)
          })
          resolve()
        }
        image.onerror = () => resolve() // Keep the country code if an asset fails.
        image.src = url
      }))).then(() => {
        if (generation !== currentGeneration || scene.isDisposed || !flagRequests.size) return
        atlas.update(); scene.metadata.needsRender = true; scene.metadata.waterReflectionsDirty = true
      })
    }
    if (community.total > 0 && community.days.length === 28) {
      const ridge = createVisitorRidge(scene, community.days)
      selectRidgeDay = ridge.selectDay
      meshes.push(...ridge.meshes); materials.push(...ridge.materials)
      const water = scene.getMaterialByName('waterMat') as WaterMaterial | null
      ridge.meshes.forEach(mesh => water?.addToRenderList(mesh))
    }

    scene.getMeshByName('contact-group')?.setEnabled(false)
    scene.metadata.guestbookActive = true
    const board = createGuestbookBoard(scene, community)
    meshes.push(...board.meshes); materials.push(...board.materials); textures.push(...board.textures)
    // A data update can arrive after browse mode has gone to sleep. Draw again
    // once new material shaders are ready, rather than leaving a blank board.
    scene.executeWhenReady(() => { if (!scene.isDisposed) scene.metadata.needsRender = true })
  }
  return { update, selectDay: (day: string | null) => selectRidgeDay(day), dispose: clear }
}
