const ballColors = [
	"#2a1665","#f1ce9b","#a5cfe0","#6866d0","#8ed9f9","#d3146b","#fce2","#73ab5c","#48261e","#dabc46","#e0266a","#79d98a","#44253d","#b43d50","#7fc2f4","#436dbc","#40a1ee","#22b12c","#4b7a3e","#c996aa","#f668d3","#ab996c","#85aeb3","#6be71e","#60178a","#73fd3a","#d18024","#8752a1","#2ab1e8","#149f1b","#6a11aa","#fab79a","#aac869","#66e508","#c50ce1","#8282bd","#6727e5","#f9dbf7","#3cabab","#be3c9e","#66d0c7","#2a1665","#72283a","#7fbfca","#6f6937","#11e46a","#a32ddf","#371160","#83ee18","#25c0d4","#8cf3a1","#ce0b2e","#29320c","#daadfa","#64c9e6","#925567","#e0135b","#c35b54","#aec5f4","#f8fe74"
]
const balls = [];

class Ball {
	constructor(number) {
		this.ticks = 0;
		this.drawn = false;
		this.number = number;
		this.color = ballColors[number - 1];
		this.position = [1, 1]
		this.speed = [1, 1];
		this.rotation = [0, 0, 0];
		this.rotationSpeed = [1, 1, 1];
		const sphere = document.createElement("div");
		sphere.className = "sphere";
		sphere.style.setProperty("--color", this.color)
		const sphereAnimation = document.createElement("div");
		sphereAnimation.className = "sphereAnimation";
		const numberBg = document.createElement("div");
		numberBg.className = "numberBg";
		const numberDiv = document.createElement("div");
		numberDiv.className = "number";
		numberDiv.innerText = number;
		sphere.appendChild(sphereAnimation)
		sphereAnimation.appendChild(numberBg);
		sphereAnimation.appendChild(numberDiv);
		this.sphere = sphere;
		this.sphereAnimation = sphereAnimation;
		document.getElementById("ballContainer").appendChild(sphere);


		this.radius = 30;
        this.containerRadius = 250;
        
        this.x = this.containerRadius; 
        this.y = this.containerRadius;
        
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
	}

	tick() {
		if(this.drawn) {
			return
		}
		this.move();
		this.rotate();
		this.ticks++;
	}

	move() {
		this.x += this.vx;
        this.y += this.vy;

        const centerX = this.containerRadius;
        const centerY = this.containerRadius;
        
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const limit = this.containerRadius - this.radius;

        if (distance > limit) {
            const nx = dx / distance;
            const ny = dy / distance;

            const dot = this.vx * nx + this.vy * ny;
            this.vx -= 2 * dot * nx;
            this.vy -= 2 * dot * ny;

            this.x = centerX + nx * limit;
            this.y = centerY + ny * limit;
        }

		if (this.ticks % 120 === 0) {
			const angle = Math.random() * Math.PI * 2;
			const impulse = 1.1; 
			this.vx += Math.cos(angle) * impulse;
			this.vy += Math.sin(angle) * impulse;
		}

        this.sphere.style.left = `${this.x - this.radius}px`;
        this.sphere.style.top = `${this.y - this.radius}px`;
	}

	rotate() {
		if(this.ticks % 60 === 0) {
			this.rotationSpeed[0] = Math.floor(Math.random() * 5) - 2;
		}
		if(this.ticks % 60 === 20) {
			this.rotationSpeed[1] = Math.floor(Math.random() * 5) - 2;
		}
		if(this.ticks % 60 === 40) {
			this.rotationSpeed[2] = Math.floor(Math.random() * 5) - 2;
		}
		this.rotation[0] += this.rotationSpeed[0];
		this.rotation[1] += this.rotationSpeed[1];
		this.rotation[2] += this.rotationSpeed[2];
		
		this.sphereAnimation.style.transform = `rotateX(${this.rotation[0]}deg) rotateY(${this.rotation[1]}deg) rotateZ(${this.rotation[2]}deg)`
	}

	moveToDrawn() {
		this.drawn = true;
		this.sphere.style.transform = "scale(1.5)"
		this.sphere.style.zIndex = 999
		this.sphereAnimation.style.transform = ""
		const drawnBalls = document.getElementById("drawnBalls");
		drawnBalls.appendChild(this.sphere);
		this.sphere.style.transform = ""
		const left = (((this.number - 1) % 10) * 65) + 5
		const top = (Math.floor((this.number - 1) / 10) * 80) + 5;
		this.sphere.style.left = left + "px";
		this.sphere.style.top = top + "px";
	}

	draw() {
		this.drawn = true;
		this.sphere.style.left = "calc(50% - 30px)";
        this.sphere.style.top = "calc(50% - 30px)";
		this.sphere.style.transform = "scale(1.5)"
		this.sphere.style.zIndex = 999
		this.sphereAnimation.style.transform = ""
		setTimeout(()=>{
			this.moveToDrawn();
		}, 3000)
	}
}

let socket;
function loop() {
	balls.forEach(b => b.tick());
	requestAnimationFrame(loop);
}


function init() {
	socket = new WebSocket("wss://pm.dounford.tech");
	socket.onmessage = (e) => {
		const data = e.data;
		const [type, message] = data.split("=");
		switch(type) {
			case "DRAWN": {
				const values = message.split(",")
				values.forEach(ball => {
					moveToDrawn(ball);
				})
			} break;
			case "DRAW": {
				drawBall(message);
			} break;
			case "WINNERS": {
				const winnerDiv = document.getElementById("winners");
				winnerDiv.innerHTML = "";
				const values = message.split(",")
				values.forEach((winner, index) => {
					const strong = document.createElement("strong");
					if(index === 0) {
						strong.innerText = "•"
					}
					strong.innerText += " " + winner.toUpperCase() + " •";
					winnerDiv.appendChild(strong);
				})
			} break;
		}
	}
	for(let i = 1; i < 61; i++) {
		balls.push(new Ball(i));
	}
	loop();
}

init()

function drawBall(number) {
	const drawn = balls.find(ball => ball.number == number);
	drawn.draw();
}

function moveToDrawn(number) {
	if(number == "") return
	const drawn = balls.find(ball => ball.number == number);
	drawn.moveToDrawn();
}

function scaleContainer() {
    const container = document.getElementById('container');

    const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 650);

    container.style.transform = `scale(${scale})`;
}


window.addEventListener('load', scaleContainer);
window.addEventListener('resize', scaleContainer);