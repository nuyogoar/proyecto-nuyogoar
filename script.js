// Variables del juego
let game;
let score = 0;
let gameRunning = false;
let gameLoop;

// Elementos del DOM
let scoreElement;
let finalScoreElement;
let startBtn;
let restartBtn;
let gameOverDiv;

// Clase principal del juego Pac-Man
class PacManGame {
    constructor() {
        this.canvasSize = 560;
        this.gridSize = 28;
        this.tileCount = this.canvasSize / this.gridSize;
        
        // Pac-Man (serpiente)
        this.pacman = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.mouthAngle = 0;
        this.mouthSpeed = 0.3;
        
        // Galleta (comida)
        this.cookie = { x: 0, y: 0 };
        this.cookieRotation = 0;
        this.cookieScale = 1;
        
        // Pasto
        this.grassPattern = [];
        this.initGrass();
    }
    
    // Inicializar patrón de pasto
    initGrass() {
        this.grassPattern = [];
        for (let i = 0; i < this.tileCount; i++) {
            this.grassPattern[i] = [];
            for (let j = 0; j < this.tileCount; j++) {
                this.grassPattern[i][j] = {
                    x: i * this.gridSize + random(this.gridSize),
                    y: j * this.gridSize + random(this.gridSize),
                    height: random(3, 8),
                    sway: random(TWO_PI)
                };
            }
        }
    }
    
    // Dibujar fondo de pasto
    drawGrass() {
        // Fondo verde
        fill(34, 139, 34);
        rect(0, 0, this.canvasSize, this.canvasSize);
        
        // Dibujar pasto
        for (let i = 0; i < this.tileCount; i++) {
            for (let j = 0; j < this.tileCount; j++) {
                let grass = this.grassPattern[i][j];
                push();
                translate(grass.x, grass.y);
                
                // Animar el pasto
                grass.sway += 0.02;
                rotate(sin(grass.sway) * 0.1);
                
                // Dibujar brizna de pasto
                stroke(0, 100, 0);
                strokeWeight(1);
                line(0, 0, 0, -grass.height);
                pop();
            }
        }
    }
    
    // Dibujar Pac-Man
    drawPacMan() {
        this.pacman.forEach((segment, index) => {
            let x = segment.x * this.gridSize + this.gridSize / 2;
            let y = segment.y * this.gridSize + this.gridSize / 2;
            let radius = this.gridSize / 2 - 2;
            
            push();
            translate(x, y);
            
            // Cuerpo de Pac-Man (amarillo)
            fill(255, 255, 0);
            stroke(255, 215, 0);
            strokeWeight(2);
            
            if (index === 0) {
                // Cabeza de Pac-Man con boca animada
                this.mouthAngle += this.mouthSpeed;
                let mouthOpen = map(sin(this.mouthAngle), -1, 1, 0.2, 0.8);
                
                // Dibujar Pac-Man con boca
                arc(0, 0, radius * 2, radius * 2, 
                    PI * mouthOpen, TWO_PI - PI * mouthOpen, PIE);
                
                // Ojo
                fill(0);
                noStroke();
                circle(-radius * 0.3, -radius * 0.3, radius * 0.3);
            } else {
                // Cuerpo (círculo simple)
                circle(0, 0, radius * 2);
            }
            pop();
        });
    }
    
    // Dibujar galleta
    drawCookie() {
        let x = this.cookie.x * this.gridSize + this.gridSize / 2;
        let y = this.cookie.y * this.gridSize + this.gridSize / 2;
        let radius = this.gridSize / 2 - 2;
        
        // Animar galleta
        this.cookieRotation += 0.05;
        this.cookieScale = 1 + sin(this.cookieRotation) * 0.1;
        
        push();
        translate(x, y);
        rotate(this.cookieRotation);
        scale(this.cookieScale);
        
        // Cuerpo de la galleta (marrón)
        fill(139, 69, 19);
        stroke(101, 67, 33);
        strokeWeight(2);
        circle(0, 0, radius * 2);
        
        // Chispas de chocolate
        fill(101, 67, 33);
        noStroke();
        for (let i = 0; i < 6; i++) {
            let angle = (TWO_PI / 6) * i;
            let sparkleX = cos(angle) * radius * 0.6;
            let sparkleY = sin(angle) * radius * 0.6;
            circle(sparkleX, sparkleY, 3);
        }
        
        // Brillo
        fill(160, 82, 45);
        circle(-radius * 0.3, -radius * 0.3, radius * 0.4);
        
        pop();
    }
    
    // Mover Pac-Man
    movePacMan() {
        if (!gameRunning) return;
        
        // Actualizar dirección
        this.direction = { ...this.nextDirection };
        
        // Calcular nueva posición
        const head = { 
            x: this.pacman[0].x + this.direction.x, 
            y: this.pacman[0].y + this.direction.y 
        };
        
        // Verificar colisiones con bordes
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            gameOver();
            return;
        }
        
        // Verificar colisión consigo mismo
        for (let segment of this.pacman) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver();
                return;
            }
        }
        
        // Agregar nueva cabeza
        this.pacman.unshift(head);
        
        // Verificar si comió la galleta
        if (head.x === this.cookie.x && head.y === this.cookie.y) {
            eatCookie();
        } else {
            // Remover cola si no comió
            this.pacman.pop();
        }
    }
    
    // Comer galleta
    eatCookie() {
        score += 1;
        updateDisplay();
        this.generateCookie();
        
        // Aumentar velocidad
        clearInterval(gameLoop);
        const newSpeed = Math.max(50, 150 - (score * 2));
        gameLoop = setInterval(() => game.movePacMan(), newSpeed);
    }
    
    // Generar nueva galleta
    generateCookie() {
        do {
            this.cookie = {
                x: Math.floor(random(this.tileCount)),
                y: Math.floor(random(this.tileCount))
            };
        } while (this.isCookieOnPacMan());
    }
    
    // Verificar si la galleta está en Pac-Man
    isCookieOnPacMan() {
        return this.pacman.some(segment => 
            segment.x === this.cookie.x && segment.y === this.cookie.y
        );
    }
    
    // Dibujar todo
    draw() {
        this.drawGrass();
        this.drawPacMan();
        this.drawCookie();
    }
    
    // Resetear juego
    reset() {
        this.pacman = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.generateCookie();
    }
}

// Configuración de p5.js
function setup() {
    let canvas = createCanvas(560, 560);
    canvas.parent('p5-container');
    
    // Inicializar juego
    game = new PacManGame();
    game.reset();
    
    // Obtener elementos del DOM
    scoreElement = document.getElementById('score');
    finalScoreElement = document.getElementById('finalScore');
    startBtn = document.getElementById('startBtn');
    restartBtn = document.getElementById('restartBtn');
    gameOverDiv = document.getElementById('gameOver');
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    
    // Controles de teclado
    document.addEventListener('keydown', handleKeyPress);
}

function draw() {
    game.draw();
}

// Manejar teclas presionadas
function handleKeyPress(e) {
    if (!gameRunning) return;
    
    // Prevenir scroll
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    switch(e.key) {
        case 'ArrowUp':
            if (game.direction.y === 0) {
                game.nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (game.direction.y === 0) {
                game.nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (game.direction.x === 0) {
                game.nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (game.direction.x === 0) {
                game.nextDirection = { x: 1, y: 0 };
            }
            break;
    }
}

// Iniciar juego
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    gameOverDiv.style.display = 'none';
    
    gameLoop = setInterval(() => game.movePacMan(), 150);
}

// Reiniciar juego
function restartGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    score = 0;
    game.reset();
    updateDisplay();
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
    gameOverDiv.style.display = 'none';
}

// Fin del juego
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    finalScoreElement.textContent = score;
    gameOverDiv.style.display = 'block';
    restartBtn.style.display = 'inline-block';
}

// Actualizar display
function updateDisplay() {
    scoreElement.textContent = score;
}