class Vect2d {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static add(x, y) {
        return new Vect2d(x.x + y.x, x.y + y.y);
    }

    static subtract(x, y) {
        return new Vect2d(x.x - y.x, x.y - y.y);
    }

    static dot(x, y) {
        return (x.x * y.x) + (x.y * y.y);
    }

    static scalarMutliply(x, scale) {
        return new Vect2d(x.x * scale, x.y * scale);
    }

    static scalarDivide(x, scale) {
        return new Vect2d(x.x * (1.0 / scale), x.y * (1.0 / scale));
    }

    static abs(x) {
        return Math.sqrt((x.x * x.x) + (x.y * x.y));
    }
}

class Ball {
    constructor(x, y, r, angle, speed, color) {
        this.position = new Vect2d(x, y);
        this.r = r;
        this.mass = Math.PI * r * r;
        this.angle = angle;
        this.speed = speed;
        this.velocity = new Vect2d(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.color = color;
    }

    intersectsBall(other) {
        let distSq = (this.position.x - other.position.x) * (this.position.x - other.position.x) +
                     (this.position.y - other.position.y) * (this.position.y - other.position.y);
        
        let radSumSq = (this.r + other.r) * (this.r + other.r);

        if (distSq <= radSumSq) 
            return true;
        else
            return false;
    }

    intersectsBoundary(width, height) {
        if (this.position.x <= this.r) return 'left';
        if (this.position.x >= width - this.r) return 'right';
        if (this.position.y <= this.r) return 'top';
        if (this.position.y >= height - this.r) return 'bottom';
        return 'none';
    }

    collideWithBall(other) {
        let posDiff = Vect2d.subtract(this.position, other.position);
        let abs = Vect2d.abs(posDiff);
        let k = Vect2d.scalarDivide(posDiff, abs);

        let m = (1.0 / this.mass) + (1.0 / other.mass);
        let veloDiff = Vect2d.subtract(this.velocity, other.velocity);
        let a = Vect2d.dot(Vect2d.scalarMutliply(k, 2), veloDiff) / m;

        this.velocity = Vect2d.subtract(this.velocity, Vect2d.scalarMutliply(k, (a / this.mass)));
        other.velocity = Vect2d.add(other.velocity, Vect2d.scalarMutliply(k, (a / other.mass)));
    }

    collideWithBoundary(direction) {
        switch(direction) {
            case 'left':
                if (this.velocity.x < 0)
                    this.velocity = new Vect2d(-1.0 * this.velocity.x, this.velocity.y);
                break;
            case 'right': 
                if (this.velocity.x > 0)
                    this.velocity = new Vect2d(-1.0 * this.velocity.x, this.velocity.y);
                break;
            case 'top':
                if (this.velocity.y < 0)
                    this.velocity = new Vect2d(this.velocity.x, -1.0 * this.velocity.y);
                break;
            case 'bottom':
                if (this.velocity.y > 0)
                    this.velocity = new Vect2d(this.velocity.x, -1.0 * this.velocity.y);
                break;
        }
    }

    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.stroke(); 
    }
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let balls = [
    new Ball(250, 150, 2, 1, 100, 'red'),
    new Ball(550, 300, 3, 2, 200, 'purple'),
    new Ball(100, 75, 4, 3, 100, 'blue'),
    new Ball(300, 250, 50, 2, 50, 'green'),
    new Ball(400, 200, 15, 1, 75, 'orange'),
]

function update(progress) {
    for (let ball of balls) {
        ball.position = Vect2d.add(ball.position, Vect2d.scalarMutliply(ball.velocity, progress / 1000.0));
    }
    let num = balls.length;
    for (let i = 0; i < num - 1; i++) {
        for (let j = i + 1; j < num; j++) {
            let ballI = balls[i];
            let ballJ = balls[j];
            if (ballI.intersectsBall(ballJ)) {
                ballI.collideWithBall(ballJ);
            }
        }
    }
    for (let ball of balls) {
        ball.collideWithBoundary(ball.intersectsBoundary(canvas.width, canvas.height));
    }
    for (let ball of balls) {
        ball.velocity = Vect2d.scalarMutliply(ball.velocity, Math.pow(1, progress))
    }
}
  
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    for (let ball of balls) {
        ball.render(ctx);
    }
}

function loop(timestamp) {
    var progress = timestamp - lastRender;
  
    update(progress);
    draw();
  
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}
var lastRender = 0;
window.requestAnimationFrame(loop);