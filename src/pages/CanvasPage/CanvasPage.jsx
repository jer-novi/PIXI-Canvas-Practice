import styles from './CanvasPage.module.css';
import {Application} from '@pixi/react';              // Stap 1: De Component uit @pixi/react
import {Text, Container} from 'pixi.js';                 // Stap 2: De Classes uit pixi.js
import {useSearchParams} from 'react-router-dom';
import {useState, useLayoutEffect, useEffect} from 'react';
import {extend, useApplication} from '@pixi/react';
import * as PIXI from 'pixi.js';
import Controls from './Controls';


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
        // Correct template literal for loading font
        document.fonts.load(`1em "${fontFamily}"`).then(() => setFontLoaded(true));
    }, [fontFamily]);
    return fontLoaded;
}

function useWindowSize() {
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

function CanvasContent({ width, height, fontSize }) {
    const [searchParams] = useSearchParams();
    const poemId = searchParams.get('poemId');
    // --- DE FIX ---
    const app = useApplication(); // useApp() wordt useApplication()

    // --- Gebruik de font loader hook ---
    const fontLoaded = useFontLoader('Cormorant Garamond'); //

  // Deze useEffect is nog steeds nodig om de PIXI renderer zelf te resizen
  useEffect(() => {
    if (app && app.renderer) {
      app.renderer.resize(width, height);
    }
  }, [width, height, app]);

    // We gebruiken nu het 'poemId' om te bepalen welke data we tonen.
    // In een echte app zou je hier een API-call doen.
    const currentPoem = poemId ? mockPoem : null;
    const titleStyle = new PIXI.TextStyle({
        fill: 'white',
        fontSize: fontSize * 1.5,
        fontFamily: 'Cormorant Garamond',
        fontWeight: 'bold',
    });

    const authorStyle = new PIXI.TextStyle({
        fill: '#cccccc',
        fontSize: fontSize * 0.75,
        fontFamily: 'Cormorant Garamond',
        fontStyle: 'italic',
    });

    const lineStyle = new PIXI.TextStyle({
        fill: 'white',
        fontSize: fontSize,
        fontFamily: 'Cormorant Garamond',
        lineHeight: fontSize * 1.4,
    });

    if (!fontLoaded) {
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
                style={{fill: 'white', fontSize: 24, fontFamily: 'Arial'}}
            />
        );
    }


    // Als er wel een gedicht is, toon de inhoud

    return (
        // We groeperen alles in een <pixiContainer> om het makkelijk te verplaatsen
        <pixiContainer x={width / 2} y={height / 4}>
            <pixiText
                text={currentPoem.title}
                anchor={{x: 0.5, y: 0}} // <-- DEZE REGEL TOEVOEGEN
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

    // We berekenen de breedte van het canvas.
    // Dit is de volledige breedte min de breedte van de controls.
    const canvasWidth = width - 340;


    // De state voor de lettergrootte ---
    const [fontSize, setFontSize] = useState(36);

    return (
        <div className={styles.canvasContainer}>
            <div className={styles.canvasWrapper}>
                <Application
                    // Geef de afmetingen door aan de Application component
                    width={canvasWidth}
                    height={height}
                    // Geef de opties door aan de Application component
                    options={{
                        // backgroundColor is nu background
                        background: 0x1d2230,
                        resolution: window.devicePixelRatio || 1,
                        autoDensity: true,
                    }}
                >
                    {/* Geef de AANGEPASTE breedte door */}
                     {/* Geef de fontSize door aan het canvas */}
                    <CanvasContent width={canvasWidth} height={height} fontSize={fontSize}/>
                </Application>
            </div>
            <Controls fontSize={fontSize} onFontSizeChange={setFontSize} />
        </div>
    );
}