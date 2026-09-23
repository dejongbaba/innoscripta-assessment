import { useCallback, useSyncExternalStore } from 'react'

import {
  clearPreferences,
  loadPreferences,
  PREFERENCES_EVENT,
  PREFERENCES_KEY,
  savePreferences,
} from '@/features/preferences/preferences.storage'
import { EMPTY_PREFERENCES, type NewsPreferencesV1 } from '@/services/news/types'

let cachedRaw: string | null | undefined
let cachedValue: NewsPreferencesV1 = EMPTY_PREFERENCES

function snapshot(): NewsPreferencesV1 {
  const raw = localStorage.getItem(PREFERENCES_KEY)
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedValue = loadPreferences()
  }
  return cachedValue
}

function subscribe(callback: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === PREFERENCES_KEY) callback()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(PREFERENCES_EVENT, callback)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(PREFERENCES_EVENT, callback)
  }
}

export function usePreferences() {
  const preferences = useSyncExternalStore(subscribe, snapshot, () => EMPTY_PREFERENCES)
  const update = useCallback((next: NewsPreferencesV1) => savePreferences(next), [])
  const reset = useCallback(() => clearPreferences(), [])
  return { preferences, update, reset }
}
