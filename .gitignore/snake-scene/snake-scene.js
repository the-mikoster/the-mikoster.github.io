import { BaseScene } from '../../canvas/base-scene.js';

export class SnakeScene extends BaseScene {
    constructor(width, height, config) {
        super(width, height, config);
    }

    update(dt) {
        this.timer += dt;
        if (this.timer > 1 / this.fps) {
            this.snake.move(); 
            this.timer = 0;
        }
    }

    draw(ctx) { }
}
