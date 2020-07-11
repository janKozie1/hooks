import React from 'react'

const useOnClickOutside = <T extends HTMLElement>(ref: React.RefObject<T>, callback: (e: MouseEvent) => void) => {
  const savedCallback = React.useRef(callback)

  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  React.useEffect(() => {
    const { current: nodeToAttachTo } = ref

    if (!nodeToAttachTo) {
      return
    }

    const call = (e: MouseEvent) => {
      savedCallback.current(e)
    }

    const handler = (e: MouseEvent) => {
      const { target } = e

      if (!(target instanceof window.Element) || nodeToAttachTo.contains(target)) {
        return
      }

      call(e)
    }

    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [ref])
}

export default useOnClickOutside
