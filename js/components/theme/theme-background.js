export class ThemeBackground {
    constructor(backgroundElem) {
        this.backgroundElem = backgroundElem;
        this.currentLoadController = null;
        this.canvasManager = null;
    }

    asyncLoad(type, src, signal) {
        return new Promise((resolve, reject) => {
            switch (type) {
                case 'image':
                    const img = new Image();

                    img.onload = () => resolve(img);
                    img.onerror = () => reject(new Error(`Error loading background image: ${src}`));

                    img.src = src;

                    break;
                case 'video':
                    const video = document.createElement('video');

                    video.innerHTML = '<p>Your browser does not support video</p>';
                    video.preload = 'auto';
                    video.playsInline = true;
                    video.disableRemotePlayback = true;
                    video.controls = false;
                    video.autoplay = true;
                    video.loop = true;
                    video.muted = true;

                    video.onloadedmetadata = () => resolve(video);
                    video.onerror = () => reject(new Error(`Error loading background video: ${src}`));

                    video.src = src;

                    break;
                default:
                    signal?.addEventListener('abort', () => {
                        reject(new Error(`Background loading canceled: ${src}`));
                    });
                    reject(new Error(`Unsupported background type: ${type}`));
            }
        });
    }

    clearBackground() {
        while (this.backgroundElem.firstChild) {
            this.backgroundElem.removeChild(this.backgroundElem.firstChild);
        }

        if (this.canvasManager) {
            this.canvasManager.destroy();
            this.canvasManager = null;
        }
    }

    async setBackground(background) {
        if (!background || !background.type) {
            throw new Error('Background config is required');
        }

        if (this.currentLoadController) {
            this.currentLoadController.abort();
            this.currentLoadController = null;
        }

        this.clearBackground();

        switch (background.type) {
            case 'canvas':
                return await this.setCanvasAnimation(background.sources, background.sceneConfig);
            case 'image':
                return await this.setImage(background.src);
            case 'video':
                return await this.setVideo(background.src);
            default:
                console.warn('Unknown background type:', background?.type);
                return null;
        }
    }

    async setCanvasAnimation(sources = {},sceneConfig = {}) {
        const canvas = document.createElement('canvas');
        canvas.classList.add('background__canvas');
        this.backgroundElem.appendChild(canvas);

        try {
            if (!sources.canvasManager) throw new Error('CanvasManager path is not defined in sources');
            if (!sources.scene) throw new Error('Scene path is not defined in sources');

            const { CanvasManager } = await import(sources.canvasManager);
            const { RainScene } = await import(sources.scene);

            this.canvasManager = new CanvasManager(canvas);
            
            this.canvasManager.setScene(RainScene, {
                dropCount: sceneConfig.dropCount || 450,
                color: sceneConfig.color || getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-primary') || '#0000ff'
            });

            await this.canvasManager.start();

            return canvas;
        } catch (error) {
            console.error('Failed to initialize canvas animation:', error);
            canvas.remove();
            throw error;
        }
    }

    async setImage(src) {
        if (!src) throw new Error('Image src is required');

        this.currentLoadController = new AbortController();

        try {
            const img = await this.asyncLoad('image', src, this.currentLoadController.signal);
            img.classList.add('background__image');
            img.alt = 'Background image';
            this.backgroundElem.appendChild(img);
            return img;
        } catch (error) {
            console.error('Image load failed:', error);
            throw error;
        }
    }

    async setVideo(src) {
        if (!src) throw new Error('Video src is required');

        this.currentLoadController = new AbortController();

        try {
            const video = await this.asyncLoad('video', src, this.currentLoadController.signal);
            video.classList.add('background__video');
            this.backgroundElem.appendChild(video);
            await video.play();
            return video;
        } catch (error) {
            console.error('Video load failed:', error);
            throw error;
        }
    }
}
