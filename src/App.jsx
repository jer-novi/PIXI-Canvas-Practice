import {Application, extend} from '@pixi/react';
import {Container, Graphics, Sprite} from 'pixi.js'; // Import van pixi.js
import {TextDemo} from './TextDemo';
import CanvasPage from "./pages/CanvasPage/CanvasPage.jsx";


// extend tells @pixi/react what Pixi.js components are available
extend({
    Container,
    Graphics,
    Sprite,
});

export default function App() {
    return (
        <CanvasPage>

        </CanvasPage>

    );
}
