import { useState, useEffect } from 'react'
import type { POI } from '@/types/poi'

type POIState = {
  pois: POI[]
  isLoading: boolean
  error: string | null
}

export const usePOIs = (): POIState => {
  const [state, setState] = useState<POIState>({
    pois: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    import('@/data/pois.json')
      .then((module) => {
        setState({
          pois: module.pois as POI[],
          isLoading: false,
          error: null,
        })
      })
      .catch((err) => {
        setState({
          pois: [],
          isLoading: false,
          error: err.message,
        })
      })
  }, [])

  return state
}