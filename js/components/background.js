export class Background {
    constructor(backgroundElem) {
        this.backgroundElem = backgroundElem;
    }

    clearBackground() {
        while (this.backgroundElem.firstChild) {
            this.backgroundElem.removeChild(this.backgroundElem.firstChild);
        }
    }

    setBackground(background) {
        switch (background.type) {
            case 'canvas':
                return this.setCanvas(this.backgroundElem, background.init);
            case 'image':
                return this.setImage(this.backgroundElem, background.src);
            case 'video':
                return this.setVideo(this.backgroundElem, background.src);
            default:
                console.warn('Unknown background type:', background && background.type);
                return null;
        }
    }

    setCanvas(parentElem, initCallback) {
        const canvas = document.createElement('canvas');
        canvas.classList.add('background__canvas');

        parentElem.appendChild(canvas);

        if (typeof initCallback === 'function') {
            try {
                return initCallback(canvas) || null;
            } catch (err) {
                console.error('BackgroundManager.setCanvas: initCallback error', err);
                return null;
            }
        }
        return null;
    }

    setImage(parentElem, src) {
        const img = document.createElement('img');
        img.classList.add('background__image');

        img.src = src || '';
        img.alt = 'Background image';

        parentElem.appendChild(img);
    
        return () => {
            try { img.remove(); } catch (e) {}
        };
    }

    setVideo(parentElem, src) {
        const video = document.createElement('video');
        video.classList.add('background__video');

        video.src = src || '';
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        parentElem.appendChild(video);
        return () => {
            try { video.pause(); video.remove(); } catch (e) {}
        };
    }
}