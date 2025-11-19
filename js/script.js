import { ThemeManager } from './components/theme-manager.js';
import { Background } from './components/background.js';
import { ThemeSelector } from './components/theme-selector.js';

import { CanvasManager } from './components/canvas/canvas-manager.js';
import { RainScene } from './components/canvas-scenes/rain-scene/rain-scene.js';

const backgroundElem = document.querySelector('.background');

const themeSelectorElems = {
    currentOption: document.querySelector('.theme-selector__current-option'),
    currentOptionLabel: document.querySelector('.theme-selector__current-option-label'),
    optionsList: document.querySelector('.theme-selector__options-list')
}
const themeSelectorClassNames = {
    active: 'active',
    hidden: 'hidden',
    option: 'theme-selector__option', 
    optionLabel: 'theme-selector__option-label',
    optionIcon: 'theme-selector__option-icon'
}

const themes = {
    default: {
        name: 'Default',
        background: {
            type: 'canvas',
        },
        additionalScripts: [
            () => { 
                const accentColorList = [
                    {
                        primary: '#d40000ff',
                        secondary: '#8b6060ff',
                    },
                    {
                        primary: '#c6d400ff',
                        secondary: '#8b8a60ff',
                    },
                    {
                        primary: '#3cd400ff',
                        secondary: '#678b60ff',
                    },
                    {
                        primary: '#00bcd4',
                        secondary: '#607d8b',
                    },
                    {
                        primary: '#0031d4ff',
                        secondary: '#60688bff',
                    },
                    {
                        primary: '#a200d4ff',
                        secondary: '#8a608bff',
                    }
                ];
                const randomAccent = accentColorList[Math.floor(Math.random() * accentColorList.length)];

                document.documentElement.style.setProperty('--color-primary', randomAccent.primary);
                document.documentElement.style.setProperty('--color-secondary', randomAccent.secondary);
            
                return () => {
                    document.documentElement.style.removeProperty('--color-primary');
                    document.documentElement.style.removeProperty('--color-secondary');
                }
            },
            () => {
                const scenesList = [
                    () => {
                        const canvasElem = document.querySelector('.background__canvas');
                        const manager = new CanvasManager(canvasElem);
                        
                        manager.setScene(RainScene, {
                            dropCount: 450,
                            color: document.documentElement.style.getPropertyValue('--color-primary')
                        });
                        
                        manager.start();

                        return () => {
                            manager.destroy();
                        };
                    }
                ];

                const randomScene = scenesList[Math.floor(Math.random() * scenesList.length)];

                try {
                    return randomScene();
                } catch {
                    console.error('Error running canvas scene', err);
                }
                
            }
        ]
    },
    goida: {
        name: 'Goida',
        background: {
            type: 'video',
            src: 'assets/videos/goida-background.mp4',
        },
        additionalScripts: null,
    },
};

const backgroundInstance = new Background(backgroundElem);
const themeSelectorInstance = new ThemeSelector(themes, themeSelectorElems, themeSelectorClassNames);
const themeManagerInstance = new ThemeManager(themes, backgroundInstance, themeSelectorInstance);

try {
    themeManagerInstance.init();
} catch (err) {
    console.error('Failed to initialize theme manager', err);
}
