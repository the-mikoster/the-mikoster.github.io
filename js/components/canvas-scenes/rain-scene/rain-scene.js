import { BaseScene } from '../../canvas/base-scene.js';

export class RainScene extends BaseScene {
    constructor(width, height, {dropCount = 100, color = '#e3e3e3'} = {}) {
        super(width, height);
        this.drops = [];
        this.dropCount = dropCount;
        this.color = color;

        for(let i=0; i<this.dropCount; i++) {
            this.drops.push(this.createDrop());
        }
    }

    createDrop() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            speed: Math.random() * 200 + 10,
            length: Math.random() * 20 + 10
        };
    }

    update(dt) {
        this.drops.forEach(drop => {
            drop.y += drop.speed * dt;

            if (drop.y > this.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.width;
            }
        });
    }

    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.drops.forEach(drop => {
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
        });

        ctx.stroke();
    }

    resize(width, height) {
        super.resize(width, height); 

        this.drops.forEach(drop => {
            drop.x = Math.random() * this.width;
        });
    }
}
