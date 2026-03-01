/**
 * Asset Debug Overlay — dev builds only.
 *
 * Statically imported in BabylonScene.tsx but all render sites are
 * guarded by `import.meta.env.DEV`, so Vite/Rollup eliminates this
 * entire module from the production bundle via dead-code elimination.
 *
 * Toggle with backtick (`). Hot-reload with Ctrl+Shift+R.
 */
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Scene as BabylonScene_ } from '@babylonjs/core/scene'
import { assetLoadStats } from './assetLoader'
import type { AssetLoadStat } from './assetLoader'
import { assetLibrary } from './assetManifest'

type Props = {
  scene: BabylonScene_ | null
  onReload: () => void
  onToggleAsset: (assetId: string) => void
}

type Snapshot = {
  fps: number
  totalTriangles: number
  activeMeshCount: number
  stats: Map<string, AssetLoadStat>
}

function statusLabel(stat: AssetLoadStat | undefined): string {
  if (!stat) return '\u23F3 pending'
  switch (stat.status) {
    case 'pending':  return '\u23F3 pending'
    case 'loaded':   return '\u2705 loaded'
    case 'fallback': return '\u26A0\uFE0F fallback'
    case 'error':    return '\u274C error'
  }
}

// ── Styles ──

const S: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 8,
    right: 8,
    zIndex: 9999,
    background: 'rgba(10, 8, 6, 0.92)',
    color: '#e8dfd0',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 1.4,
    padding: '8px 10px',
    borderRadius: 4,
    border: '1px solid #c9a84c',
    minWidth: 340,
    maxWidth: 440,
    userSelect: 'none',
    pointerEvents: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 5,
    borderBottom: '1px solid #3d2b1e',
    gap: 8,
  },
  title: {
    color: '#c9a84c',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
  },
  statsRow: {
    display: 'flex',
    gap: 14,
    marginBottom: 6,
    color: '#c9a84c',
    fontSize: 10,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 10,
  },
  th: {
    textAlign: 'left' as const,
    color: '#8a7050',
    fontWeight: 'normal',
    paddingBottom: 3,
    borderBottom: '1px solid #3d2b1e',
    whiteSpace: 'nowrap' as const,
  },
  thRight: {
    textAlign: 'right' as const,
    color: '#8a7050',
    fontWeight: 'normal',
    paddingBottom: 3,
    borderBottom: '1px solid #3d2b1e',
    paddingLeft: 8,
  },
  td: {
    padding: '2px 0 2px 0',
    verticalAlign: 'middle' as const,
    whiteSpace: 'nowrap' as const,
  },
  tdRight: {
    padding: '2px 0 2px 8px',
    textAlign: 'right' as const,
    verticalAlign: 'middle' as const,
    color: '#a89060',
  },
  tdAction: {
    padding: '2px 0 2px 8px',
    verticalAlign: 'middle' as const,
  },
  reloadBtn: {
    background: '#3d2b1e',
    border: '1px solid #c9a84c',
    color: '#c9a84c',
    borderRadius: 2,
    cursor: 'pointer',
    fontSize: 10,
    padding: '2px 7px',
    whiteSpace: 'nowrap' as const,
  },
  toggleBtn: {
    background: 'transparent',
    border: '1px solid #5a4030',
    color: '#a89060',
    borderRadius: 2,
    cursor: 'pointer',
    fontSize: 9,
    padding: '1px 5px',
    whiteSpace: 'nowrap' as const,
  },
  toggleBtnDisabled: {
    background: 'transparent',
    border: '1px solid #3d2b1e',
    color: '#4a3828',
    borderRadius: 2,
    cursor: 'default',
    fontSize: 9,
    padding: '1px 5px',
    whiteSpace: 'nowrap' as const,
  },
  hint: {
    marginTop: 5,
    paddingTop: 4,
    borderTop: '1px solid #3d2b1e',
    color: '#4a3828',
    fontSize: 9,
  },
}

// ── Component ──

export function AssetDebugOverlay({ scene, onReload, onToggleAsset }: Props) {
  const [snap, setSnap] = useState<Snapshot>({
    fps: 0,
    totalTriangles: 0,
    activeMeshCount: 0,
    stats: new Map(),
  })

  useEffect(() => {
    const id = setInterval(() => {
      if (!scene) return
      const stats = new Map(assetLoadStats)
      const totalTriangles = Math.round(
        [...stats.values()].reduce((sum, v) => sum + v.triangleCount, 0),
      )
      setSnap({
        fps: Math.round(scene.getEngine().getFps()),
        totalTriangles,
        activeMeshCount: scene.getActiveMeshes().length,
        stats,
      })
    }, 500)
    return () => clearInterval(id)
  }, [scene])

  return (
    <div style={S.overlay}>
      <div style={S.header}>
        <span style={S.title}>Asset Debug</span>
        <button style={S.reloadBtn} onClick={onReload}>
          Reload All (Ctrl+Shift+R)
        </button>
      </div>

      <div style={S.statsRow}>
        <span>FPS: {snap.fps}</span>
        <span>Tris: {snap.totalTriangles.toLocaleString()}</span>
        <span>Active meshes: {snap.activeMeshCount}</span>
      </div>

      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Asset</th>
            <th style={S.th}>Status</th>
            <th style={S.thRight}>Tris</th>
            <th style={S.thRight}>Mats</th>
            <th style={S.thRight}>ms</th>
            <th style={S.thRight}></th>
          </tr>
        </thead>
        <tbody>
          {assetLibrary.map(entry => {
            const stat = snap.stats.get(entry.id)
            const isPending = !stat || stat.status === 'pending'
            const isLoaded = stat?.status === 'loaded'
            const displayId = entry.id.length > 24 ? entry.id.slice(0, 22) + '\u2026' : entry.id

            return (
              <tr key={entry.id}>
                <td style={S.td}>
                  <span title={entry.id}>{displayId}</span>
                </td>
                <td style={{ ...S.td, paddingLeft: 8, color: stat?.status === 'loaded' ? '#6ab04c' : stat?.status === 'error' ? '#e55' : '#c9a84c' }}>
                  {statusLabel(stat)}
                </td>
                <td style={S.tdRight}>
                  {stat && stat.triangleCount > 0 ? stat.triangleCount.toLocaleString() : '\u2014'}
                </td>
                <td style={S.tdRight}>
                  {stat && stat.materialCount > 0 ? stat.materialCount : '\u2014'}
                </td>
                <td style={S.tdRight}>
                  {stat && stat.loadTimeMs > 0 ? stat.loadTimeMs.toFixed(0) : '\u2014'}
                </td>
                <td style={S.tdAction}>
                  <button
                    style={isPending ? S.toggleBtnDisabled : S.toggleBtn}
                    disabled={isPending}
                    onClick={() => !isPending && onToggleAsset(entry.id)}
                  >
                    {isLoaded ? '\u2192 fallback' : '\u2192 GLB'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={S.hint}>
        Backtick (`) to hide &nbsp;&bull;&nbsp; Ctrl+Shift+R to reload
      </div>
    </div>
  )
}
