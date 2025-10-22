// Variables del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverDiv = document.getElementById('gameOver');
const gameBoard = document.getElementById('gameBoard');

// Configuración del juego
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Estado del juego
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameRunning = false;
let gameLoop;

// Inicializar el juego
function init() {
    // Resetear serpiente
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    // Resetear dirección
    dx = 1;
    dy = 0;
    
    // Resetear puntuación
    score = 0;
    gameRunning = false;
    
    // Generar comida
    generateFood();
    
    // Actualizar display
    updateDisplay();
    
    // Dibujar estado inicial
    draw();
}

// Generar comida en posición aleatoria
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (isFoodOnSnake());
}

// Verificar si la comida está en la serpiente
function isFoodOnSnake() {
    return snake.some(segment => segment.x === food.x && segment.y === food.y);
}

// Dibujar el juego
function draw() {
    // Limpiar canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar serpiente (roja con segmentos)
    ctx.fillStyle = '#e74c3c';
    snake.forEach((segment, index) => {
        // Cabeza más clara, cuerpo más oscuro
        if (index === 0) {
            ctx.fillStyle = '#e74c3c';
        } else {
            ctx.fillStyle = '#c0392b';
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1, 
            segment.y * gridSize + 1, 
            gridSize - 2, 
            gridSize - 2
        );
        
        // Borde del segmento
        ctx.strokeStyle = '#a93226';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * gridSize + 1, 
            segment.y * gridSize + 1, 
            gridSize - 2, 
            gridSize - 2
        );
    });
    
    // Dibujar comida (círculo azul)
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;
    const radius = (gridSize - 4) / 2;
    
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Borde del círculo
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Mover la serpiente
function moveSnake() {
    if (!gameRunning) return;
    
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Verificar colisión con bordes - GAME OVER
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Verificar colisión consigo misma - GAME OVER
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    // Agregar nueva cabeza
    snake.unshift(head);
    
    // Verificar si comió la comida
    if (head.x === food.x && head.y === food.y) {
        eatFood();
    } else {
        // Remover cola si no comió (para que crezca al comer)
        snake.pop();
    }
    
    draw();
}

// Comer comida
function eatFood() {
    score += 1; // 1 punto por comida
    updateDisplay();
    generateFood();
    
    // Aumentar velocidad ligeramente
    clearInterval(gameLoop);
    const newSpeed = Math.max(50, 150 - (score * 2));
    gameLoop = setInterval(moveSnake, newSpeed);
}

// Actualizar display
function updateDisplay() {
    scoreElement.textContent = score;
}

// Iniciar juego
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    gameOverDiv.style.display = 'none';
    
    // Iniciar bucle del juego
    gameLoop = setInterval(moveSnake, 150);
}

// Reiniciar juego
function restartGame() {
    clearInterval(gameLoop);
    init();
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
    gameOverDiv.style.display = 'none';
}

// Fin del juego
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    // Mostrar mensaje de juego terminado
    finalScoreElement.textContent = score;
    gameOverDiv.style.display = 'block';
    restartBtn.style.display = 'inline-block';
}

// Controles del teclado
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    // Prevenir scroll con las flechas
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    switch(e.key) {
        case 'ArrowUp':
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});

// Event listeners para botones
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// Inicializar el juego al cargar la página
init();