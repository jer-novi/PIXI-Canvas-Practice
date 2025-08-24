import { useState, useEffect } from 'react';

export function useFontLoader(fontFamily) {
    const [fontLoaded, setFontLoaded] = useState(false);
    
    useEffect(() => {
        // Correct template literal for loading font
        document.fonts.load(`1em "${fontFamily}"`).then(() => setFontLoaded(true));
    }, [fontFamily]);
    
    return fontLoaded;
}
