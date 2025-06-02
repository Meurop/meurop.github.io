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

const shiitakeTemplates = [
    { kasaW: 60, kasaH: 30, jikuW: 15, jikuH: 40, color: 'saddlebrown', stemColor: 'peachpuff' },
    { kasaW: 80, kasaH: 25, jikuW: 20, jikuH: 30, color: 'chocolate', stemColor: 'bisque' },
    { kasaW: 50, kasaH: 35, jikuW: 12, jikuH: 50, color: 'sienna', stemColor: 'papayawhip' },
];

let currentShiitakeBody = null;
let currentShiitakeManualX = canvas.width / 2;
let shiitakeDx = SHIITAKE_SPEED_X;
let isDropping = false;
let stackedShiitakeBodies = [];
let score = 0;
let gameOverFlag = false;

// ⭐ 地面の摩擦力をアップ！
const groundBody = Bodies.rectangle(canvas.width / 2, GROUND_Y + 15, canvas.width, 30, {
    isStatic: true,
    label: "ground",
    friction: 0.7,          // ⭐ 地面の動摩擦係数を上げてみる (例: 0.1 -> 0.7)
    frictionStatic: 0.9     // ⭐ 地面の静止摩擦係数を上げてみる (例: 0.5 -> 0.9)
});

function getShiitakeRenderData(body) {
    const template = body.template || shiitakeTemplates[0];
    return {
        x: body.position.x,
        y: body.position.y,
        angle: body.angle,
        template: template
    };
}

function drawShiitake(shiitakeData) {
    const x = shiitakeData.x;
    const y = shiitakeData.y;
    const angle = shiitakeData.angle;
    const template = shiitakeData.template;
    const kasaW = template.kasaW;
    const kasaH = template.kasaH;
    const jikuW = template.jikuW;
    const jikuH = template.jikuH;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = template.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, kasaW / 2, kasaH / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    const jikuTopYOffset = kasaH / 2;
    ctx.fillStyle = template.stemColor;
    ctx.fillRect(-jikuW / 2, jikuTopYOffset, jikuW, jikuH);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    const crossOffsetX = kasaW * 0.15;
    const crossOffsetY = kasaH * 0.15;
    ctx.beginPath();
    ctx.moveTo(-crossOffsetX, -crossOffsetY);
    ctx.lineTo(crossOffsetX, crossOffsetY);
    ctx.moveTo(crossOffsetX, -crossOffsetY);
    ctx.lineTo(-crossOffsetX, crossOffsetY);
    ctx.stroke();
    ctx.restore();
}

function spawnNewShiitake() {
    if (gameOverFlag) return;
    const template = shiitakeTemplates.random();
    currentShiitakeManualX = canvas.width / 2;
    const body = Bodies.trapezoid(currentShiitakeManualX, SHIITAKE_START_Y, template.kasaW * 0.8, template.kasaH + template.jikuH, 0.2, {
        friction: 0.6,          // ⭐ しいたけの動摩擦係数を上げてみる (例: 0.4 -> 0.6)
        frictionStatic: 100.0,    // ⭐ しいたけの静止摩擦係数をしっかり設定 (例: 0.5 -> 0.8)
        restitution: 0.05,
        density: 0.001,
        isStatic: true,
        label: "currentShiitake"
    });
    currentShiitakeBody = body;
    currentShiitakeBody.template = template;

    isDropping = false;
    shiitakeDx = SHIITAKE_SPEED_X * (Math.random() < 0.5 ? 1 : -1);
    World.add(world, currentShiitakeBody);
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

    if (!currentShiitakeBody && !gameOverFlag) {
        spawnNewShiitake();
    }

    if (currentShiitakeBody) {
        if (!isDropping) {
            currentShiitakeManualX += shiitakeDx;
            const bodyWidth = currentShiitakeBody.bounds.max.x - currentShiitakeBody.bounds.min.x;
            const kasaHalfWidth = bodyWidth / 2;
            if (currentShiitakeManualX + kasaHalfWidth > canvas.width) {
                currentShiitakeManualX = canvas.width - kasaHalfWidth;
                shiitakeDx *= -1;
            } else if (currentShiitakeManualX - kasaHalfWidth < 0) {
                currentShiitakeManualX = kasaHalfWidth;
                shiitakeDx *= -1;
            }
            Body.setPosition(currentShiitakeBody, { x: currentShiitakeManualX, y: SHIITAKE_START_Y });
        }

        drawShiitake(getShiitakeRenderData(currentShiitakeBody));

        if (isDropping && currentShiitakeBody && !currentShiitakeBody.isStatic && !gameOverFlag) {
            let collidedTarget = null;
            let collisionDataWithGround = SAT.collides(currentShiitakeBody, groundBody);
            if (collisionDataWithGround && collisionDataWithGround.collided) {
                collidedTarget = groundBody;
            } else {
                for (const stacked of stackedShiitakeBodies) {
                    let collisionDataWithStacked = SAT.collides(currentShiitakeBody, stacked);
                    if (collisionDataWithStacked && collisionDataWithStacked.collided) {
                        collidedTarget = stacked;
                        break;
                    }
                }
            }

            if (collidedTarget) {
                // ⭐ 「着地した」と判断する速度の条件 (前回と同じ)
                if (Math.abs(currentShiitakeBody.velocity.y) < 0.05 &&
                    Math.abs(currentShiitakeBody.velocity.x) < 0.05 &&
                    Math.abs(currentShiitakeBody.angularVelocity) < 0.02) {
                    
Body.setStatic(currentShiitakeBody, true); 
                    stackedShiitakeBodies.push(currentShiitakeBody);
                    score += 10;
                    scoreDisplay.textContent = score;
                    currentShiitakeBody = null;
                    isDropping = false;
                }
            }

            if (currentShiitakeBody) {
                const bounds = currentShiitakeBody.bounds;
                if (bounds.max.x < 0 || bounds.min.x > canvas.width || bounds.min.y > canvas.height + 20) {
                    gameOverFlag = true;
                }
            }
        }
    }

    for (let i = stackedShiitakeBodies.length - 1; i >= 0; i--) {
        const body = stackedShiitakeBodies[i];
        drawShiitake(getShiitakeRenderData(body));
        if (!gameOverFlag) {
            const bounds = body.bounds;
            if (bounds.max.x < 0 || bounds.min.x > canvas.width || bounds.min.y > canvas.height + 20) {
                gameOverFlag = true;
            }
        }
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
    if (currentShiitakeBody && !isDropping && !gameOverFlag) {
        isDropping = true;
        Body.setStatic(currentShiitakeBody, false);
        Body.setAngularVelocity(currentShiitakeBody, (Math.random() - 0.5) * 0.1);
        Body.setVelocity(currentShiitakeBody, { x: (Math.random() - 0.5) * 1, y: 2 });
    }
});

resetButton.addEventListener('click', () => {
    initGame();
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && currentShiitakeBody && !isDropping && !gameOverFlag) {
        isDropping = true;
        Body.setStatic(currentShiitakeBody, false);
        Body.setAngularVelocity(currentShiitakeBody, (Math.random() - 0.5) * 0.1);
        Body.setVelocity(currentShiitakeBody, { x: (Math.random() - 0.5) * 1, y: 2 });
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

    stackedShiitakeBodies = [];
    currentShiitakeBody = null; 
    
    score = 0;
    scoreDisplay.textContent = score;
    gameOverFlag = false;
    gameOverText.style.display = 'none';
    
    isDropping = false; 
    
    spawnNewShiitake();
    
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

console.log("しいたけタワー！ (Matter.js版) が読み込まれたよ！ 'R'キーかリセットボタンでリスタート！");
initGame();