export class ThemeBackground {
    constructor(backgroundElem, notificationManagerInstance) {
        this.backgroundElem = backgroundElem;
        this.notificationManagerInstance = notificationManagerInstance;

        this.currentNotification = null;

        this.currentLoadController = null;
        this.canvasManager = null;
    }

    removeCurrentNotification() {
        if (this.currentNotification) {
            this.notificationManagerInstance.hideSingleMessage(this.currentNotification);
            this.currentNotification = null;
        }
    }

    asyncLoad(type, src, signal) {
        this.removeCurrentNotification();

        this.currentNotification = this.notificationManagerInstance.showMessage(
            'info',
            'Background is loading...'
        );

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
            case 'canvas':
                Promise.all([
                    import(src.canvasManager),
                    import(src.scene)
                ])
                    .then(([canvasManagerModule, sceneModule]) => {
                    resolve({
                        type: 'canvas',
                        CanvasManager: canvasManagerModule.CanvasManager,
                        Scene: sceneModule[src.sceneName || 'Scene'],
                        config: src.config || {}
                    });
                    })
                    .catch(err => {
                    reject(new Error(`Failed to load canvas modules: ${err.message}`));
                    });

                break;
            default:
                signal?.addEventListener('abort', () => {
                    this.removeCurrentNotification();

                    this.currentNotification = this.notificationManagerInstance.showMessage(
                        'error',
                        `Unsupported background type: ${type}`
                    );

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

        try {
            let result;
            switch (background.type) {
            case 'canvas':
                result = await this.setCanvasAnimation(background.sources, background.sceneConfig);
                break;
            case 'image':
                result = await this.setImage(background.src);
                break;
            case 'video':
                result = await this.setVideo(background.src);
                break;
            default:
                console.warn('Unknown background type:', background?.type);
                result = null;
            }

            this.removeCurrentNotification();

            return result;
        } catch (error) {
            console.error('Background load failed:', error);

            this.removeCurrentNotification();

            this.currentNotification = this.notificationManagerInstance.showMessage(
                'error',
                `Failed to load background`
            );

            throw error;
        }
    }

    async setCanvasAnimation(sources = {}, sceneConfig = {}) {
        const canvas = document.createElement('canvas');
        canvas.classList.add('background__canvas');
        this.backgroundElem.appendChild(canvas);

        try {
            if (!sources.canvasManager) throw new Error('CanvasManager path is not defined in sources');
            if (!sources.scene) throw new Error('Scene path is not defined in sources');

            const canvasData = await this.asyncLoad('canvas', {
                canvasManager: sources.canvasManager,
                scene: sources.scene,
                sceneName: sources.sceneName,
                config: sceneConfig
            });

            this.canvasManager = new canvasData.CanvasManager(canvas);
            this.canvasManager.setScene(canvasData.Scene, canvasData.config);

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
