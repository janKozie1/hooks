import { useState, useRef, useEffect, useCallback } from 'react'

const useTimeout = (callback: () => void, callAfter: number) => {
    const savedCallback = useRef(callback);
    const timeoutRef = useRef<number>()
    const [ran, setHasRan] = useState(false);
    
    const call = useCallback(() => {
        setHasRan(true);
        savedCallback.current();
    }, [])

    const stop = useCallback(() => {
        clearTimeout(timeoutRef.current)
    }, []);

    const reset = useCallback(() => {
        stop();
        setHasRan(false)
        timeoutRef.current = setTimeout(call, callAfter)
    }, [call, stop, callAfter])

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback])

    useEffect(() => {
        timeoutRef.current = setTimeout(call, callAfter)
        return () => timeoutRef.current ? clearTimeout(timeoutRef.current) : undefined
    }, [callAfter, call]);

    return {stop, reset, ran}

}

export default useTimeout;