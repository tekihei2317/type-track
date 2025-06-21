import * as React from 'react'

// https://github.com/radix-ui/website/blob/d2320dcab33ace003d1c00df7c7942f74e0c722a/utils/use-effect-event.ts
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function useEffectEvent<T extends Function>(fn: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = React.useRef<any>(() => {
    throw new Error('Cannot call an event handler while rendering.')
  })
  React.useInsertionEffect(() => {
    ref.current = fn
  }, [fn])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return React.useCallback((...args: any[]) => ref.current?.(...args), [ref]) as any
}
