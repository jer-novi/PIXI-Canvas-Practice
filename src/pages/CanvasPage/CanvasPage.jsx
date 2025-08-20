import {Application} from '@pixi/react';              // Stap 1: De Component uit @pixi/react
import {Text, Container} from 'pixi.js';                 // Stap 2: De Classes uit pixi.js
import {useSearchParams} from 'react-router-dom';
import {useState, useLayoutEffect, useEffect} from 'react';
import {extend, useApplication} from '@pixi/react';
import * as PIXI from 'pixi.js';

extend({Text, Container});

// Mock data voor en gedicht
const mockPoem = {
    id: 123,
    title: 'De Sterrenhemel',
    author: "H. Marsman",
    lines: [
        "De zee, de zee, de zee,",
        "altijd de zee.",
        "Zij is de spiegel van mijn ziel,",
        "de bron van mijn bestaan."
    ]
};

// --- Een hook specifiek voor het laden van het font ---

function useFontLoader(fontFamily) {
    const [fontLoaded, setFontLoaded] = useState(false);


    useEffect(() => {
        document.fonts.load('1em "{fontFamily}"').then(() => {
            setFontLoaded(true);
        });
    }, [fontFamily]);

    return fontLoaded;
}

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
    const {width, height} = useWindowSize();
    const [searchParams] = useSearchParams();
    const poemId = searchParams.get('poemId');
    // --- DE FIX ---
    const app = useApplication(); // useApp() wordt useApplication()

    // --- Gebruik de font loader hook ---
    const fontLoaded = useFontLoader('Cormorant Garamond'); //

    useEffect(() => {

        if (app && app.renderer) { // Extra check of 'app' bestaat
            app.renderer.resize(width, height);
        }
    }, [width, height, app]);

    // We gebruiken nu het 'poemId' om te bepalen welke data we tonen.
    // In een echte app zou je hier een API-call doen.
    const currentPoem = poemId ? mockPoem : null;

    const titleStyle = new PIXI.TextStyle({
        fill: 'white',
        fontSize: 48,
        fontFamily: 'Cormorant Garamond', // <-- AANPASSING
        fontWeight: 'bold',
    });

    const authorStyle = new PIXI.TextStyle({
        fill: '#cccccc',
        fontSize: 24,
        fontFamily: 'Cormorant Garamond', // <-- AANPASSING
        fontStyle: 'italic',
    });

    const lineStyle = new PIXI.TextStyle({
        fill: 'white',
        fontSize: 32,
        fontFamily: 'Cormorant Garamond', // <-- AANPASSING
        lineHeight: 44, // Extra ruimte tussen de regels
    });

    if (!fontLoaded) {
        // Wacht tot het font geladen is
        return (
            <pixiText
                text="Laden..."
                anchor={{x: 0.5, y: 0.5}}
                x={width / 2}
                y={height / 2}
                style={{fill: 'white', fontSize: 24, fontFamily: 'Arial'}}
            />
        );
    }

    if (!currentPoem) {
        return (
            <pixiText
                text="Geen gedicht gekozen. Voeg ?poemId=123 toe aan de URL."
                anchor={{x: 0.5, y: 0.5}}
                x={width / 2}
                y={height / 2}
                style={titleStyle}
            />
        );
    }


    // Als er wel een gedicht is, toon de inhoud

    return (
        // We groeperen alles in een <pixiContainer> om het makkelijk te verplaatsen
        <pixiContainer x={width / 2} y={height / 4}>
            <pixiText
                text={currentPoem.title}
                anchor={{x: 0.5, y: 0}}
                y={0}
                style={titleStyle}
            />

            <pixiText
                text={currentPoem.author}
                anchor={{x: 0.5, y: 0}}
                y={60} // Iets onder de titel
                style={authorStyle}
            />
            {currentPoem.lines.map((line, index) => (
                <pixiText
                    key={index}
                    text={line}
                    anchor={{x: 0.5, y: 0}}
                    y={120 + index * 44} // Iets onder de auteur, met ruimte en stapel de regels onder elkaar
                    style={lineStyle}
                />
            ))}
        </pixiContainer>
    );
}

// Dit is de hoofd-export, die de state beheert
export default function CanvasPage() {
    // De hook wordt hier één keer aangeroepen
    const {width, height} = useWindowSize();

    return (
        <Application
            // Geef de afmetingen door aan de Application component
            width={width}
            height={height}
            // Geef de opties door aan de Application component
            options={{
                // backgroundColor is nu background
                background: 0x1d2230,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            }}
        >
            {/* Geef de afmetingen door aan het kind-component */}
            <CanvasContent width={width} height={height}/>
        </Application>
    );
}