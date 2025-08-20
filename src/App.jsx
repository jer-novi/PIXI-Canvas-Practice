import {Application, extend} from '@pixi/react';
import {Container, Graphics, Sprite} from 'pixi.js'; // Import van pixi.js
import {TextDemo} from './TextDemo';
import CanvasPage from "./pages/CanvasPage/CanvasPage.jsx";
import {useEffect, useState} from "react";


// extend tells @pixi/react what Pixi.js components are available
extend({
    Container,
    Graphics,
    Sprite,
});

export default function App() {
    const [fontMode, setFontMode] = useState('serif');


    useEffect(() => {
        document.body.classList.remove('font-serif', 'font-sans');
        document.body.classList.add(fontMode === 'serif' ? 'font-serif' : 'font-sans');
    }, [fontMode]);
    return (
        <CanvasPage>

        </CanvasPage>

    );
}
