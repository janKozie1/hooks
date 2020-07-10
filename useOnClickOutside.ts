import React from 'react'

const useOnClickOutside = <T extends HTMLElement>(
    ref: React.RefObject<T>,
    callback: (e: React.MouseEvent<T, 'click'>) => void
) => {
    const savedCallback = React.useRef(callback)

    React.useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    React.useEffect(() => {
        const { current: nodeToAttachTo } = ref

        if (!nodeToAttachTo) {
            return
        }

        const call = (e: React.MouseEvent<T, 'click'>) => {
            savedCallback.current(e)
        }

        const handler = (e: React.MouseEvent<T, 'click'>) => {
            const { target } = e
            if (
                !(target instanceof window.Element) ||
                nodeToAttachTo.contains(target)
            ) {
                return
            }

            call(e)
        }

        document.addEventListener(
            'click',
            (handler as unknown) as EventListener
        )
        return () =>
            document.removeEventListener(
                'click',
                (handler as unknown) as EventListener
            )
    }, [ref])
}

export default useOnClickOutside
