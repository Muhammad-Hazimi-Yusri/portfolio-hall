import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { PointLight } from '@babylonjs/core/Lights/pointLight'

export function createLights(scene: Scene) {
  // Ambient light
  const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.4
  ambient.groundColor = new Color3(0.1, 0.1, 0.15)

  // Main ceiling light
  const ceiling = new PointLight('ceiling', new Vector3(0, 3.5, 0), scene)
  ceiling.intensity = 0.8
  ceiling.diffuse = new Color3(1, 0.95, 0.85) // warm

  return { ambient, ceiling }
}