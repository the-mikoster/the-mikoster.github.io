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
        let outputBackgroundElem = undefined;
        switch (background.type) {
            case 'canvas':
                outputBackgroundElem = this.setCanvas();
                break;
            case 'image':
                outputBackgroundElem = this.setImage(background.src);
                break;
            case 'video':
                outputBackgroundElem = this.setVideo(background.src);
                break;
            default:
                console.warn('Unknown background type:', background && background.type);
                outputBackgroundElem =  null;
        }
        
        return outputBackgroundElem;
    }

    setCanvas() {
        const canvas = document.createElement('canvas');
        canvas.classList.add('background__canvas');
        
        this.backgroundElem.appendChild(canvas);
    }

    setImage(src) {
        const img = document.createElement('img');
        img.classList.add('background__image');

        img.src = src || '';
        img.alt = 'Background image';

        this.backgroundElem.appendChild(img);
    }

    setVideo(src) {
        const video = document.createElement('video');
        video.classList.add('background__video');

        video.src = src || '';
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        this.backgroundElem.appendChild(video);
    }
}
