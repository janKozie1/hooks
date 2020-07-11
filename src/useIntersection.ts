import { useState, useRef, useEffect } from 'react'

type Options = Partial<IntersectionObserverInit>

const defaultOptions: Options = {
    threshold: 0,
    rootMargin: '0px',
    root: document.body,
}

const useIntersection = <T extends React.RefObject<HTMLElement | null>>(
    rootNode: T,
    cb: (isIntersecting: boolean) => void,
    options: Options = defaultOptions
) => {
    const savedCallback = useRef(cb)
    const [observer, setObserver] = useState<IntersectionObserver | null>(null)

    const { rootMargin, threshold } = { ...defaultOptions, ...options }

    useEffect(() => {
        savedCallback.current = cb
    }, [cb])

    useEffect(() => {
        let init = 0

        const call = (entries: IntersectionObserverEntry[]) => {
            console.log(entries)
            if (init) savedCallback.current(entries[0].isIntersecting)
            init++
        }

        setObserver(
            new IntersectionObserver(call, {
                threshold,
                rootMargin,
            })
        )
    }, [rootMargin, threshold])

    useEffect(() => {
        const { current: nodeToObserve } = rootNode

        if (!nodeToObserve || !observer) {
            return
        }

        observer.observe(nodeToObserve)
        return () => observer.unobserve(nodeToObserve)
    }, [observer, rootNode])

    return
}

export default useIntersection
