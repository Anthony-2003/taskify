import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
  } from 'react'
  
  import { useEventCallback, useEventListener } from 'usehooks-ts'
  
  declare global {
    interface WindowEventMap {
      'local-storage': CustomEvent
    }
  }
  
  /**
   * Represents the options for customizing the behavior of serialization and deserialization.
   * @template T - The type of the state to be stored in local storage.
   * @interface Options
   * @property {(value: T) => string} [serializer] - A function to serialize the value before storing it.
   * @property {(value: string) => T} [deserializer] - A function to deserialize the stored value.
   */
  interface Options<T> {
    serializer?: (value: T) => string
    deserializer?: (value: string) => T
  }
  
  type SetValue<T> = Dispatch<SetStateAction<T>>
  
  const IS_SERVER = typeof window === 'undefined'
  
  /**
   * Custom hook for using local storage to persist state across page reloads.
   * @template T - The type of the state to be stored in local storage.
   * @param {string} key - The key under which the value will be stored in local storage.
   * @param {T | (() => T)} initialValue - The initial value of the state or a function that returns the initial value.
   * @param {Options<T>} [options] - Options for customizing the behavior of serialization and deserialization (optional).
   * @returns {[T, Dispatch<SetStateAction<T>>]} A tuple containing the stored value and a function to set the value.
   * @see [Documentation](https://usehooks-ts.com/react-hook/use-local-storage)
   * @see [MDN Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
   * @example
   * const [count, setCount] = useLocalStorage('count', 0);
   * // Access the `count` value and the `setCount` function to update it.
   */
  export function useLocalStorage<T>(
    key: string,
    initialValue: T | (() => T),
    options: Options<T> = {},
  ): [T, SetValue<T>] {
    // Pass initial value to support hydration server-client
    const [storedValue, setStoredValue] = useState<T>(initialValue)
  
    const serializer = useCallback<(value: T) => string>(
      value => {
        if (options.serializer) {
          return options.serializer(value)
        }
  
        if (value instanceof Map) {
          return JSON.stringify(Object.fromEntries(value))
        }
  
        if (value instanceof Set) {
          return JSON.stringify(Array.from(value))
        }
  
        return JSON.stringify(value)
      },
      [options],
    )
  
    const deserializer = useCallback<(value: string) => T>(
      value => {
        if (options.deserializer) {
          return options.deserializer(value)
        }
        // Support 'undefined' as a value
        if (value === 'undefined') {
          return undefined as unknown as T
        }
  
        const parsed = JSON.parse(value)
  
        if (initialValue instanceof Set) {
          return new Set(parsed)
        }
  
        if (initialValue instanceof Map) {
          return new Map(Object.entries(parsed))
        }
  
        if (initialValue instanceof Date) {
          return new Date(parsed)
        }
  
        return parsed
      },
      [options, initialValue],
    )
  
    // Get from local storage then
    // parse stored json or return initialValue
    const readValue = useCallback((): T => {
      const initialValueToUse =
        initialValue instanceof Function ? initialValue() : initialValue
  
      // Prevent build error "window is undefined" but keeps working
      if (IS_SERVER) {
        return initialValueToUse
      }
  
      try {
        const raw = window.localStorage.getItem(key)
        return raw ? deserializer(raw) : initialValueToUse
      } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error)
        return initialValueToUse
      }
    }, [initialValue, key, deserializer])
  
    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue: SetValue<T> = useEventCallback(value => {
      // Prevent build error "window is undefined" but keeps working
      if (IS_SERVER) {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`,
        )
      }
  
      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(readValue()) : value
  
        // Save to local storage
        window.localStorage.setItem(key, serializer(newValue))
  
        // Save state
        setStoredValue(newValue)
  
        // We dispatch a custom event so every similar useLocalStorage hook is notified
        window.dispatchEvent(new StorageEvent('local-storage', { key }))
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error)
      }
    })
  
    useEffect(() => {
      setStoredValue(readValue())
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])
  
    const handleStorageChange = useCallback(
      (event: StorageEvent | CustomEvent) => {
        if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
          return
        }
        setStoredValue(readValue())
      },
      [key, readValue],
    )
  
    // this only works for other documents, not the current one
    useEventListener('storage', handleStorageChange)
  
    // this is a custom event, triggered in writeValueToLocalStorage
    // See: useLocalStorage()
    useEventListener('local-storage', handleStorageChange)
  
    return [storedValue, setValue]
  }