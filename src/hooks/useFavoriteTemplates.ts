import { useState, useCallback, useEffect } from 'react'

const FAVORITES_STORAGE_KEY = 'agentic-processes-favorites'

type TemplateType = 'process' | 'step'

function buildKey(type: TemplateType, name: string): string {
  return `${type}:${name}`
}

function loadFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return new Set(parsed)
      }
    }
  } catch (error) {
    console.error('Failed to load favorites:', error)
  }
  return new Set()
}

function saveFavorites(favorites: Set<string>): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)))
  } catch (error) {
    console.error('Failed to save favorites:', error)
  }
}

export function useFavoriteTemplates() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites)

  // Persist favorites when they change
  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const toggleFavorite = useCallback((type: TemplateType, name: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      const key = buildKey(type, name)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const isFavorite = useCallback((type: TemplateType, name: string): boolean => {
    return favorites.has(buildKey(type, name))
  }, [favorites])

  // Count favorites by type
  const countFavorites = useCallback((type: TemplateType): number => {
    let count = 0
    const prefix = `${type}:`
    favorites.forEach(key => {
      if (key.startsWith(prefix)) count++
    })
    return count
  }, [favorites])

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    countFavorites
  }
}
