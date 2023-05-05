import React, { useRef } from 'react'

export default function useDebounce(func, delay) {
    const ref = useRef(null);
    return (...args) => {
        clearTimeout(ref.current);
        ref.current = setTimeout(() => {
            func(...args)
        }, delay);
    }
}
