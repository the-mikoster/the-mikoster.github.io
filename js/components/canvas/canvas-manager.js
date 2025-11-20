export class CanvasManager {
    constructor(canvasElem) {
        this.canvas = canvasElem;
        this.ctx = this.canvas.getContext('2d');
        this.currentScene = null;

        this.animationId = null;
        this.lastTime = 0;

        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    setScene(SceneClass, config = {}) {
        if (this.currentScene && typeof this.currentScene.destroy === 'function') {
            this.currentScene.destroy();
        }

        this.currentScene = new SceneClass(this.canvas.width, this.canvas.height, config);

        if (typeof this.currentScene.init === 'function') {
            this.currentScene.init(this.ctx);
        }
    }

    start() {
        if (!this.animationId) {
            this.lastTime = performance.now();
            this.loop(this.lastTime);
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    loop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.currentScene) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (typeof this.currentScene.update === 'function') {
                this.currentScene.update(deltaTime);
            }

            if (typeof this.currentScene.draw === 'function') {
                this.currentScene.draw(this.ctx);
            }
        }

        this.animationId = requestAnimationFrame(this.loop);
    }

    resize() {
        const dpr = window.devicePixelRatio || 1; // for Retina/High DPI displays

        // Real size
        this.canvas.width = document.documentElement.clientWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;

        // Visual size (css)
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;

        this.ctx.scale(dpr, dpr);

        if (this.currentScene && typeof this.currentScene.resize === 'function') {
            this.currentScene.resize(window.innerWidth, window.innerHeight);
        }
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', this.resize);
        if (this.currentScene && typeof this.currentScene.destroy === 'function') {
            this.currentScene.destroy();
        }
        this.canvas.remove();
    }
}
