import { CanvasManager } from '../canvas/canvas-manager.js';
import { RainScene } from '../canvas-scenes/rain-scene/rain-scene.js';

export const themes = {
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
                } catch (err) {
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
