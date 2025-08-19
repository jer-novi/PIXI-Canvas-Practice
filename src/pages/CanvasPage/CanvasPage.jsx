import { Application } from '@pixi/react';              // Stap 1: De Component uit @pixi/react
import { Text, Container } from 'pixi.js';                 // Stap 2: De Classes uit pixi.js
import { useSearchParams } from 'react-router-dom';
import { useState, useLayoutEffect, useEffect } from 'react';
import { extend, useApplication } from '@pixi/react';
import * as PIXI from 'pixi.js';

extend({ Text, Container });

function useWindowSize() {
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    useLayoutEffect(() => {
        function updateSize() {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

function CanvasContent() {
    const { width, height } = useWindowSize();
    const [searchParams] = useSearchParams();
    const poemId = searchParams.get('poemId');
    // --- DE FIX ---
    const app = useApplication(); // useApp() wordt useApplication()

    useEffect(() => {
        if (app && app.renderer) { // Extra check of 'app' bestaat
            app.renderer.resize(width, height);
        }
    }, [width, height, app]);

    const textStyle = new PIXI.TextStyle({
        fill: 'white',
        fontSize: 48,
        fontFamily: 'Arial',
    });

    return (
        <pixiContainer>
            <pixiText
                text={poemId ? `Gedicht ID: ${poemId}` : 'Geen gedicht gekozen'}
                anchor={{ x: 0.5, y: 0.5 }}
                x={width / 2}
                y={height / 2}
                style={{
                    fontFamily: 'Arial',
                    fontSize: 36,
                    fill: 0xffffff,
                    align: 'center'
                }}
            />
        </pixiContainer>
    );
}

export default function CanvasPage() {
    const { width, height } = useWindowSize();

    return (
        <Application
            options={{
                width,
                height,
                backgroundColor: 0x1d2230,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            }}
        >
            <CanvasContent />
        </Application>
    );
}