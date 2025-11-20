const Snake = class {
    constructor(canvas, ctx, gridConfig, cellsList) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridConfig = gridConfig;
        this.cellsList = cellsList;
        this.isAlive = true;
        this.segments = [];
        this.minSegmentsCount = 3;
        const directions = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
        const randomDirectionIndex = getRandomInt(0, directions.length - 1);
        this.direction = directions[randomDirectionIndex];
        this.color = getRandomRGBColor();
        this.create();
    }

    addSegment() {
        const randomCellIndex = getRandomInt(0, this.cellsList.length - 1);
        const randomCell = this.cellsList[randomCellIndex];
        this.segments.push({ x: randomCell.x, y: randomCell.y });
    }

    create() {
        for (let i = 0; i < this.minSegmentsCount; i++) {
            this.addSegment();
        }
    }

    get head() {
        return this.segments[0];
    }

    checkCollisionOfSelf() {
        for (let i = 1; i < this.segments.length; i++) {
            if (this.head.x === this.segments[i].x && this.head.y === this.segments[i].y) {
                return true;
            }
        }
        return false;
    }

    move() {
        if (!this.isAlive) return;

        // Calculate grid dimensions
        const cellSize = this.gridConfig.size + this.gridConfig.gap;
        const maxX = Math.floor(this.canvas.width / cellSize);
        const maxY = Math.floor(this.canvas.height / cellSize);

        // Checking for proximity to edges ...
        const edgeBuffer = 2; // How many cells away from edge to start avoiding
        const nextX = this.head.x + this.direction.x;
        const nextY = this.head.y + this.direction.y;

        // ... then, try to change direction
        // Try to move by vertical
        if (nextX <= edgeBuffer || nextX >= maxX - edgeBuffer - 1) {
            if (this.direction.x !== 0) {
                if (this.head.y > maxY / 2) {
                    this.direction = { x: 0, y: -1 };
                } else {
                    this.direction = { x: 0, y: 1 };
                }
            }
        }

        // Try to move by horizontal
        if (nextY <= edgeBuffer || nextY >= maxY - edgeBuffer - 1) {
            if (this.direction.y !== 0) {
                if (this.head.x > maxX / 2) {
                    this.direction = { x: -1, y: 0 };
                } else {
                    this.direction = { x: 1, y: 0 };
                }
            }
        }

        const closestFood = this.findClosestFood();
        if (closestFood) {
            this.gotoClosestFood(closestFood);
        }

        // Move snake
        const head = {
            x: this.head.x + this.direction.x,
            y: this.head.y + this.direction.y
        };

        // Keep snake in bounds
        head.x = Math.max(0, Math.min(head.x, maxX - 1));
        head.y = Math.max(0, Math.min(head.y, maxY - 1));
        if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
            this.isAlive = false;
            return;
        }

        this.segments.unshift(head);
        this.segments.pop();

        if (this.checkCollisionOfSelf()) {
            this.isAlive = false;
        }
    }

    draw() {
        if (!this.isAlive) return;

        this.ctx.fillStyle = this.color;
        this.segments.forEach(segment => {
            this.ctx.fillRect(
                segment.x * (this.gridConfig.size + this.gridConfig.gap),
                segment.y * (this.gridConfig.size + this.gridConfig.gap),
                this.gridConfig.size,
                this.gridConfig.size
            );
        });
    }

    findClosestFood() {
        let closestFood = null;
        let minDistance = Infinity;
        for (const food of window.game.foodList) {
            const dx = food.x - this.head.x;
            const dy = food.y - this.head.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                closestFood = food;
            }
        }
        return closestFood;
    }

    gotoClosestFood(food) {
        const dx = food.x - this.head.x;
        const dy = food.y - this.head.y;

        // Find nearest snake
        let nearestSnake = null;
        let minSnakeDistance = Infinity;
        for (const otherSnake of window.game.snakeList) {
            if (otherSnake === this) continue;
            const snakeDx = otherSnake.head.x - this.head.x;
            const snakeDy = otherSnake.head.y - this.head.y;
            const snakeDistance = Math.sqrt(snakeDx * snakeDx + snakeDy * snakeDy);
            if (snakeDistance < minSnakeDistance) {
                minSnakeDistance = snakeDistance;
                nearestSnake = otherSnake;
            }
        }

        // To check if we need to avoid a collision
        const nextX = this.head.x + this.direction.x;
        const nextY = this.head.y + this.direction.y;
        const willCollide = this.segments.some(segment => segment.x === nextX && segment.y === nextY) || (nearestSnake && nearestSnake.segments.some(segment => segment.x === nextX && segment.y === nextY));
        if (willCollide) {
            if (this.direction.x !== 0) {
                // Move by horizontal, try vertical
                const newY = this.head.y + Math.sign(dy);
                if (!this.segments.some(segment => segment.x === this.head.x && segment.y === newY)) {
                    this.direction = { x: 0, y: Math.sign(dy) };
                }
            } else {
                // Move by vertical, try horizontal
                const newX = this.head.x + Math.sign(dx);
                if (!this.segments.some(segment => segment.x === newX && segment.y === this.head.y)) {
                    this.direction = { x: Math.sign(dx), y: 0 };
                }
            }
            return;
        }

        // Try to move towards food if no collision
        if (Math.abs(dx) > Math.abs(dy)) {
            // Try horizontal movement
            const newX = this.head.x + Math.sign(dx);
            if (!this.segments.some(segment => segment.x === newX && segment.y === this.head.y)) {
                this.direction = { x: Math.sign(dx), y: 0 };
            }
        } else {
            // Try vertical movement
            const newY = this.head.y + Math.sign(dy);
            if (!this.segments.some(segment => segment.x === this.head.x && segment.y === newY)) {
                this.direction = { x: 0, y: Math.sign(dy) };
            }
        }
    }
};

const Food = class {
    constructor(canvas, ctx, gridConfig, cellsList) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridConfig = gridConfig;
        this.cellsList = cellsList;
        const randomIndex = getRandomInt(0, this.cellsList.length - 1);
        const randomCell = this.cellsList[randomIndex];
        this.x = randomCell.x;
        this.y = randomCell.y;
        this.color = 'rgb(255, 255, 255)';
    }

    draw() {
        const size = this.gridConfig['size'];
        const gap = this.gridConfig['gap'];
        const x = this.x * (size + gap);
        const y = this.y * (size + gap);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(x, y, size, size);
    }
}

const Game = class {
    constructor(canvasElem) {
        this.canvas = canvasElem;
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) alert('Canvas not supported in your browser :(');
        this.config = {
            snakeCount: 10,
            fps: 15,
            grid: {
                size: 8,
                gap: 4
            }
        };
        this.cellsList = [];
        this.snakeList = [];
        this.foodList = [];
        this.createGrid();
        this.loadCanvasData();
        window.game = this; // !global

        this.saveCanvasDataInterval = 10000;
        setInterval(() => {
            this.saveCanvasData();
        }, this.saveCanvasDataInterval);
    }

    getConfig() {
        return this.config;
    }

    updateConfig(newConfig) {
        this.config = newConfig;
    }

    createGrid() {
        this.cellsList = [];
        const rows = Math.floor(this.canvas.width / (this.config['grid']['size'] + this.config['grid']['gap']));
        const cols = Math.floor(this.canvas.height / (this.config['grid']['size'] + this.config['grid']['gap']));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.cellsList.push({
                    x: i,
                    y: j
                });
            }
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createGrid();
    }

    loadCanvasData()  {
        try {
            const savedData = JSON.parse(localStorage.getItem('CanvasData'));

            savedData.snakeList.forEach(savedSnake => {
                const newSnake = new Snake(this.canvas, this.ctx, this.config['grid'], this.cellsList);
                newSnake.segments = savedSnake.segments;
                newSnake.direction = savedSnake.direction;
                newSnake.color = savedSnake.color;
                newSnake.isAlive = savedSnake.isAlive;
                this.snakeList.push(newSnake);
            });

            savedData.foodList.forEach(savedFood => {
                const newFood = new Food(this.canvas, this.ctx, this.config['grid'], this.cellsList);
                newFood.x = savedFood.x;
                newFood.y = savedFood.y;
                newFood.color = savedFood.color;
                this.foodList.push(newFood);
            });
        } catch (error) {
            this.snakeList = [];
            this.foodList = [];
        }
    }

    saveCanvasData() {
        const snakeData = this.snakeList.map(snake => ({
            segments: snake.segments,
            direction: snake.direction,
            color: snake.color,
            isAlive: snake.isAlive
        }));

        const foodData = this.foodList.map(food => ({
            x: food.x,
            y: food.y,
            color: food.color
        }));

        localStorage.setItem('CanvasData', JSON.stringify({}));
        localStorage.setItem('CanvasData', JSON.stringify({
            'snakeList': snakeData,
            'foodList': foodData
        }));
    }


    checkCollisionSomeSnakeAndFood() {
        for (let i = this.foodList.length - 1; i >= 0; i--) {
            const food = this.foodList[i];
            for (let snake of this.snakeList) {
                if (snake.head.x === food.x && snake.head.y === food.y) {
                    this.foodList.splice(i, 1);
                    const newSegment = {
                        x: snake.head.x,
                        y: snake.head.y
                    };
                    snake.segments.push(newSegment);
                    break;
                }
            }
        }
    }

    checkSomeSnakeCollision() {
        for (let snake1 of this.snakeList) {
            for (let snake2 of this.snakeList) {
                if (snake1 === snake2) continue; // Skip self-comparison

                if (snake1.head.x === snake2.head.x && snake1.head.y === snake2.head.y) {
                    for (let segment of snake1.segments) {
                        const newFood = new Food(this.canvas, this.ctx, this.config['grid'], this.cellsList);
                        newFood.x = segment.x;
                        newFood.y = segment.y;
                        this.foodList.push(newFood);
                    }
                    for (let segment of snake2.segments) {
                        const newFood = new Food(this.canvas, this.ctx, this.config['grid'], this.cellsList);
                        newFood.x = segment.x;
                        newFood.y = segment.y;
                        this.foodList.push(newFood);
                    }

                    const indexOfSnake1 = this.snakeList.indexOf(snake1);
                    const indexOfSnake2 = this.snakeList.indexOf(snake2);
                    if (indexOfSnake1 < indexOfSnake2) {
                        this.snakeList.splice(indexOfSnake2, 1);
                        this.snakeList.splice(indexOfSnake1, 1);
                    } else {
                        this.snakeList.splice(indexOfSnake1, 1);
                        this.snakeList.splice(indexOfSnake2, 1);
                    }
                    return;
                }

                // Check snake 1's head and snake 2's body colliding
                if (snake2.segments.slice(1).some(segment => segment.x === snake1.head.x && segment.y === snake1.head.y)) {
                    for (let segment of snake1.segments) {
                        const newFood = new Food(this.canvas, this.ctx, this.config['grid'], this.cellsList);
                        newFood.x = segment.x;
                        newFood.y = segment.y;
                        this.foodList.push(newFood);
                    }

                    const indexOfSnake1 = this.snakeList.indexOf(snake1);
                    this.snakeList.splice(indexOfSnake1, 1);
                    return;
                }

                // Check snake 2's head and snake 1's body colliding
                if (snake1.segments.slice(1).some(segment => segment.x === snake2.head.x && segment.y === snake2.head.y)) {
                    for (let segment of snake2.segments) {
                        const newFood = new Food(this.canvas, this.ctx, this.config['grid'], this.cellsList);
                        newFood.x = segment.x;
                        newFood.y = segment.y;
                        this.foodList.push(newFood);
                    }
                    const indexOfSnake2 = this.snakeList.indexOf(snake2);
                    this.snakeList.splice(indexOfSnake2, 1);
                    return;
                }
            }
        }
    }

    listenFPSChange() {
        const listenFPSChangeInterval = setInterval(() => {
            if (this.config['fps'] >  0) {
                this.animate();
                clearInterval(listenFPSChangeInterval);
            }
        }, 100);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.snakeList = this.snakeList.filter(snake => snake.isAlive);

        while (this.snakeList.length < this.config['snakeCount']) {
            const newSnake = new Snake(this.canvas, this.ctx, this.config['grid'], this.cellsList);
            this.snakeList.push(newSnake);
        }

        while (this.foodList.length < this.config['snakeCount']) {
            const newFood = new Food(this.canvas, this.ctx, this.config['grid'], this.cellsList);
            this.foodList.push(newFood);
        }

        for (let snake of this.snakeList) {
            snake.move();
        }

        this.checkCollisionSomeSnakeAndFood();
        this.checkSomeSnakeCollision();

        for (let food of this.foodList) {
            food.draw();
        }
        for (let snake of this.snakeList) {
            snake.draw();
        }

        const frameTimeout = setTimeout(() => {
            requestAnimationFrame(() => this.animate());
        }, 1e3 / this.config['fps']);

        if (this.config['fps'] === 0) {
            clearTimeout(frameTimeout);
            this.stop()
        }
    }

    start() {
        this.resize();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    stop() {
        this.listenFPSChange();
    }
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomRGBColor() {
    const r = getRandomInt(0, 255);
    const g = getRandomInt(0, 255);
    const b = getRandomInt(0, 255);
    return `rgb(${r}, ${g}, ${b})`;
}

export { Game };
