import { useState, useLayoutEffect } from 'react';

export function useWindowSize() {
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useLayoutEffect(() => {
        function update() {
            setSize({width: window.innerWidth, height: window.innerHeight});
        }

        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    
    return size;
}
