import { ThemeManager } from './components/theme-manager.js';
import { Background } from "./components/background.js";

import { Game } from './components/backgroung-canvas/animation.js';

const backgroundElem = document.querySelector('.background');

const themes = {
    'default': {
        name: 'default',
        background: {
            type: 'canvas',
            src: null,
            init: (canvasElem) => {
                const animation = new Game(canvasElem);
                animation.start();
                return () => {
                    try { animation.stop(); } catch (e) { console.error(e); }
                };
            }
        }
    },
};

const backgroundInstance = new Background(backgroundElem);
const themeManagerInstance = new ThemeManager(themes, backgroundInstance);

try {
    themeManagerInstance.init();
} catch (err) {
    console.error('Failed to initialize theme manager', err);
}