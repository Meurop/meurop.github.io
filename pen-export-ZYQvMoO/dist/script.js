// Matter.js のエイリアス
const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    SAT = Matter.SAT;

// --- ゲーム画面の準備 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dropButton = document.getElementById('dropButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverText = document.getElementById('gameOverText');
const resetButton = document.getElementById('resetButton');

let isDebugMode = false;

canvas.width = 300;
canvas.height = 500;

// --- Matter.js の設定 ---
const engine = Engine.create();
const world = engine.world;
world.gravity.y = 0.8;
engine.world.airFriction = 0.005;

// --- ゲームの設定 ---
const GROUND_Y = canvas.height - 30;
const SHIITAKE_START_Y = 50;
const SHIITAKE_SPEED_X = 1.0;

const imagePaths = [
    'https://i.imgur.com/CM934fu.png',
    'https://i.imgur.com/J48DDV1.png',
    'https://i.imgur.com/eNMYGNf.png'
];

const characterTemplates = [
    { width: 62.8, height: 58.5, imageIndex: 0 },
    { width: 40.35, height: 44.4, imageIndex: 1 },
    { width: 39.3, height: 37.5, imageIndex: 2 },
];

const characterImages = [];
let imagesLoadedCount = 0;
function preloadImages() {
    for (let i = 0; i < imagePaths.length; i++) {
        const img = new Image();
        img.src = imagePaths[i];
        img.onload = () => {
            imagesLoadedCount++;
            if (imagesLoadedCount === imagePaths.length) {
                initGame();
            }
        };
        img.onerror = () => { console.error(`Failed to load image at: ${imagePaths[i]}`); };
        characterImages.push(img);
    }
}

let currentCharacterBody = null;
let currentCharacterManualX = canvas.width / 2;
let characterDx = SHIITAKE_SPEED_X;
let isDropping = false;
let stackedBodies = [];
let score = 0;
let gameOverFlag = false;

const groundBody = Bodies.rectangle(canvas.width / 2, GROUND_Y + 15, canvas.width, 30, {
    isStatic: true,
    label: "ground",
    friction: 0.7,
    frictionStatic: 0.9
});

function getRenderData(body) {
    const template = body.template || characterTemplates[0];
    return {
        x: body.position.x,
        y: body.position.y,
        angle: body.angle,
        template: template
    };
}

function drawCharacter(characterData) {
    const x = characterData.x;
    const y = characterData.y;
    const angle = characterData.angle;
    const template = characterData.template;
    const img = characterImages[template.imageIndex];

    if (!img || !img.complete) { return; }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -template.width / 2, -template.height / 2, template.width, template.height);
    ctx.restore();
}

function spawnNewCharacter() {
    if (gameOverFlag) return;
    const template = characterTemplates.random();
    currentCharacterManualX = canvas.width / 2;
    const body = Bodies.rectangle(
        currentCharacterManualX,
        SHIITAKE_START_Y,
        template.width,
        template.height,
        {
            friction: 0.6,
            frictionStatic: 0.8,
            restitution: 0.05,
            density: 0.001,
            isStatic: true,
            label: "currentCharacter"
        }
    );
    currentCharacterBody = body;
    currentCharacterBody.template = template;
    isDropping = false;
    characterDx = SHIITAKE_SPEED_X * (Math.random() < 0.5 ? 1 : -1);
    World.add(world, currentCharacterBody);
}


function gameLoop() {
    if (gameOverFlag) {
        if (gameOverText.style.display !== 'block') {
            gameOverText.textContent = `ゲームオーバー！ スコア: ${score}`;
            gameOverText.style.display = 'block';
        }
        return;
    }

    Engine.update(engine, 1000 / 60);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'limegreen';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    if (!currentCharacterBody && !gameOverFlag) {
        spawnNewCharacter();
    }

    if (currentCharacterBody) {
        if (!isDropping) {
            currentCharacterManualX += characterDx;
            const bodyWidth = currentCharacterBody.bounds.max.x - currentCharacterBody.bounds.min.x;
            const halfWidth = bodyWidth / 2;
            if (currentCharacterManualX + halfWidth > canvas.width) {
                currentCharacterManualX = canvas.width - halfWidth;
                characterDx *= -1;
            } else if (currentCharacterManualX - halfWidth < 0) {
                currentCharacterManualX = halfWidth;
                characterDx *= -1;
            }
            Body.setPosition(currentCharacterBody, { x: currentCharacterManualX, y: SHIITAKE_START_Y });
        }
        drawCharacter(getRenderData(currentCharacterBody));
        if (isDropping && currentCharacterBody && !currentCharacterBody.isStatic && !gameOverFlag) {
            let collidedTarget = null;
            let collisionDataWithGround = SAT.collides(currentCharacterBody, groundBody);
            if (collisionDataWithGround && collisionDataWithGround.collided) {
                collidedTarget = groundBody;
            } else {
                for (const stacked of stackedBodies) {
                    let collisionDataWithStacked = SAT.collides(currentCharacterBody, stacked);
                    if (collisionDataWithStacked && collisionDataWithStacked.collided) {
                        collidedTarget = stacked;
                        break;
                    }
                }
            }
            if (collidedTarget) {
                if (Math.abs(currentCharacterBody.velocity.y) < 0.05 && Math.abs(currentCharacterBody.velocity.x) < 0.05 && Math.abs(currentCharacterBody.angularVelocity) < 0.02) {
                    
                    Body.setStatic(currentCharacterBody, true); // ⭐⭐ この一行を追加したよ！ ⭐⭐
                    
                    stackedBodies.push(currentCharacterBody);
                    score += 10;
                    scoreDisplay.textContent = score;
                    currentCharacterBody = null;
                    isDropping = false;
                }
            }
            if (currentCharacterBody) {
                const bounds = currentCharacterBody.bounds;
                if (bounds.max.x < 0 || bounds.min.x > canvas.width || bounds.min.y > canvas.height + 20) {
                    gameOverFlag = true;
                }
            }
        }
    }

    for (let i = stackedBodies.length - 1; i >= 0; i--) {
        const body = stackedBodies[i];
        drawCharacter(getRenderData(body));
        if (!gameOverFlag) {
            const bounds = body.bounds;
            if (bounds.max.x < 0 || bounds.min.x > canvas.width || bounds.min.y > canvas.height + 20) {
                gameOverFlag = true;
            }
        }
    }

    if (isDebugMode) {
        const allBodies = Composite.allBodies(engine.world);
        ctx.beginPath();
        for (let i = 0; i < allBodies.length; i++) {
            const body = allBodies[i];
            const vertices = body.vertices;
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let j = 1; j < vertices.length; j++) {
                ctx.lineTo(vertices[j].x, vertices[j].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.stroke();
    }

    if (!gameOverFlag) {
        gameLoopRequestId = requestAnimationFrame(gameLoop);
    } else {
        if (gameOverText.style.display !== 'block') {
             gameOverText.textContent = `ゲームオーバー！ スコア: ${score}`;
             gameOverText.style.display = 'block';
        }
    }
}

dropButton.addEventListener('click', () => {
    if (currentCharacterBody && !isDropping && !gameOverFlag) {
        isDropping = true;
        Body.setStatic(currentCharacterBody, false);
        Body.setAngularVelocity(currentCharacterBody, (Math.random() - 0.5) * 0.1);
        Body.setVelocity(currentCharacterBody, { x: (Math.random() - 0.5) * 1, y: 2 });
    }
});

resetButton.addEventListener('click', () => {
    initGame();
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && currentCharacterBody && !isDropping && !gameOverFlag) {
        isDropping = true;
        Body.setStatic(currentCharacterBody, false);
        Body.setAngularVelocity(currentCharacterBody, (Math.random() - 0.5) * 0.1);
        Body.setVelocity(currentCharacterBody, { x: (Math.random() - 0.5) * 1, y: 2 });
        event.preventDefault();
    }
    if (event.key.toLowerCase() === 'r' && gameOverFlag) {
        initGame();
    }
});

function initGame() {
    if (typeof gameLoopRequestId !== 'undefined' && gameLoopRequestId !== null) {
        cancelAnimationFrame(gameLoopRequestId);
        gameLoopRequestId = null;
    }
    World.clear(engine.world, false); 
    Engine.clear(engine); 
    World.add(engine.world, groundBody);
    stackedBodies = [];
    currentCharacterBody = null; 
    score = 0;
    scoreDisplay.textContent = score;
    gameOverFlag = false;
    gameOverText.style.display = 'none';
    isDropping = false; 
    spawnNewCharacter();
    if (!gameOverFlag) { 
        gameLoopRequestId = requestAnimationFrame(gameLoop);
    }
}

if (!Array.prototype.random) {
    Array.prototype.random = function() {
        return this[(Math.random() * this.length) | 0];
    };
}

let gameLoopRequestId = null;

console.log("しいたけタワー！ (画像バージョン) の準備を始めるよ！");
preloadImages();
