// Matter.js のエイリアス
const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Events = Matter.Events,
    SAT = Matter.SAT;

// --- ゲーム画面の準備 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverText = document.getElementById('gameOverText');
const resetButton = document.getElementById('resetButton');
const startButton = document.getElementById('startButton');
const highScoreList = document.getElementById('highScoreList');
const mobileControls = document.getElementById('mobileControls');

let isDebugMode = false;

canvas.width = 300;
canvas.height = 500;

// --- Matter.js の設定 ---
const engine = Engine.create();
const world = engine.world;
world.gravity.y = 0;
engine.world.airFriction = 0;

// --- ゲーム設定 ---
const PLAYER_START_Y = canvas.height - 50;
const PLAYER_SPEED = 3.5;
const BULLET_MIN_SPEED = 1.5;
const BULLET_MAX_SPEED = 3.5;
const BULLET_MIN_SIZE = 8;
const BULLET_MAX_SIZE = 25;
const INITIAL_SPAWN_INTERVAL = 700;
const MIN_SPAWN_INTERVAL = 100;
const DIFFICULTY_INCREASE_RATE = 0.993;

const imagePaths = {
    player: 'https://i.imgur.com/aKirIQi.jpeg',
    bullet: 'https://i.imgur.com/KUJF01b.png'
};

const entityTemplates = {
    player: { width: 35, height: 35, imageKey: 'player' },
    bullet: { imageKey: 'bullet' }
};

// --- グローバル変数 ---
const loadedImages = {};
let imagesToLoad = Object.keys(imagePaths).length;
let imagesLoadedCount = 0;
let playerBody = null;
let bullets = [];
let score = 0;
let startTime = 0;
let gameRunning = false;
let gameOverFlag = false;
let spawnInterval = INITIAL_SPAWN_INTERVAL;
let spawnTimer = null;
let difficultyTimer = null;
const keysPressed = {};
let pTargetVel = { x: 0, y: 0 }; // let で宣言！
let gameLoopRequestId = null;
let highScores = [];

// --- 画像読み込み ---
function preloadImages() {
    console.log("Starting image loading...");
    imagesLoadedCount = 0;
    let validImageCount = 0;
    for (const key in imagePaths) {
        if(imagePaths[key]){
            validImageCount++;
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imagePaths[key];
            img.onload = () => {
                console.log(`Image loaded: ${img.src}`);
                imagesLoadedCount++;
                if (imagesLoadedCount === validImageCount) {
                    console.log("All images loaded successfully.");
                    prepareGame();
                }
            };
            img.onerror = () => { console.error(`Failed to load image at: ${imagePaths[key]}`); };
            loadedImages[key] = img;
        } else {
             console.warn(`Image path for ${key} is empty.`);
             imagesToLoad--;
        }
    }
     if (validImageCount === 0){
         console.warn("No valid image paths provided. Cannot start game.");
     }
}

// --- プレイヤー操作 ---
function handleKeyDown(event) {
    keysPressed[event.key] = true;
    updatePlayerTargetVelocity();
    if (event.key.toLowerCase() === 'r' && gameOverFlag) {
        prepareGame();
    }
    if (!gameRunning && !gameOverFlag && event.key === 'Enter') {
        startGame();
    }
}
function handleKeyUp(event) {
    keysPressed[event.key] = false;
    updatePlayerTargetVelocity();
}
function updatePlayerTargetVelocity() {
    if (!gameRunning || gameOverFlag) return;
    pTargetVel.x = 0;
    pTargetVel.y = 0;
    if (keysPressed['ArrowLeft'] || keysPressed['a']) pTargetVel.x = -PLAYER_SPEED;
    if (keysPressed['ArrowRight'] || keysPressed['d']) pTargetVel.x = PLAYER_SPEED;
    if (keysPressed['ArrowUp'] || keysPressed['w']) pTargetVel.y = -PLAYER_SPEED;
    if (keysPressed['ArrowDown'] || keysPressed['s']) pTargetVel.y = PLAYER_SPEED;
}
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// --- スマホ用ボタン操作 ---
function setupMobileControls() {
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const controls = [btnUp, btnDown, btnLeft, btnRight];
    controls.forEach(btn => {
        if(btn){
            const direction = getDirectionFromButtonId(btn.id);
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); keysPressed[direction] = true; updatePlayerTargetVelocity(); });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed[direction] = false; updatePlayerTargetVelocity(); });
            btn.addEventListener('mousedown', (e) => { keysPressed[direction] = true; updatePlayerTargetVelocity(); });
            btn.addEventListener('mouseup', (e) => { keysPressed[direction] = false; updatePlayerTargetVelocity(); });
            btn.addEventListener('mouseleave', (e) => { keysPressed[direction] = false; updatePlayerTargetVelocity(); });
        }
    });
}
function getDirectionFromButtonId(id) {
    switch (id) {
        case 'btnUp': return 'ArrowUp';
        case 'btnDown': return 'ArrowDown';
        case 'btnLeft': return 'ArrowLeft';
        case 'btnRight': return 'ArrowRight';
        default: return '';
    }
}

// --- 描画 ---
function getRenderData(body) {
     let template;
     if (!body) return null;
     if (body.label === 'player') {
         template = entityTemplates.player;
     } else if (body.label === 'bullet' && body.template) {
         template = { imageKey: entityTemplates.bullet.imageKey, width: body.template.width, height: body.template.height };
     } else { return null; }
    return { x: body.position.x, y: body.position.y, angle: body.angle, template: template, width: template.width, height: template.height };
}
function drawEntity(entityData) {
    if (!entityData || !entityData.template) return;
    const { x, y, angle, template, width, height } = entityData;
    const img = loadedImages[template.imageKey];
    if (!img || !img.complete || !width || !height) { return; }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
}

// --- 弾生成 ---
function spawnBullet() {
    if (gameOverFlag || !playerBody || !gameRunning) return;
    const timeElapsed = Math.max(0, (Date.now() - startTime)) / 1000;
    const difficultyFactor = Math.min(1, timeElapsed / 60);
    const speed = BULLET_MIN_SPEED + (BULLET_MAX_SPEED - BULLET_MIN_SPEED) * difficultyFactor * Math.random();
    const size = BULLET_MIN_SIZE + (BULLET_MAX_SIZE - BULLET_MIN_SIZE) * difficultyFactor * Math.random();
    const x = Math.random() * canvas.width;
    const y = -size;
    const bulletBody = Bodies.rectangle(x, y, size, size, {
        frictionAir: 0, label: "bullet", restitution: 0.8,
        template: { width: size, height: size, imageKey: entityTemplates.bullet.imageKey }
    });
    const angle = Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 4);
    Body.setVelocity(bulletBody, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
    Body.setAngularVelocity(bulletBody, (Math.random() - 0.5) * 0.1);
    World.add(world, bulletBody);
    bullets.push(bulletBody);
}
function startOrAdjustBulletSpawner() {
    if (spawnTimer) { clearInterval(spawnTimer); }
    if (!gameOverFlag && gameRunning) {
         spawnTimer = setInterval(spawnBullet, spawnInterval);
         spawnInterval = Math.max(MIN_SPAWN_INTERVAL, spawnInterval * DIFFICULTY_INCREASE_RATE);
    }
}

// --- ハイスコア処理 ---
function loadHighScores() {
    try { const scores = localStorage.getItem('nyankoDanmakuHighScores'); highScores = scores ? JSON.parse(scores) : []; }
    catch (e) { console.warn("Could not load high scores:", e); highScores = []; }
}
function saveHighScore() {
     try {
        highScores.push(parseFloat(score));
        highScores.sort((a, b) => b - a);
        highScores = highScores.slice(0, 10);
        localStorage.setItem('nyankoDanmakuHighScores', JSON.stringify(highScores));
     } catch (e) { console.warn("Could not save high score:", e); }
}
function displayHighScores() {
    highScoreList.innerHTML = '';
    if (highScores.length === 0) {
        highScoreList.innerHTML = '<li>まだスコアがありません</li>';
    } else {
        highScores.forEach((s, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${s.toFixed(2)} 秒`;
            highScoreList.appendChild(li);
        });
    }
}

// --- ゲームループ ---
function gameLoop() {
    if (!gameRunning || gameOverFlag) { return; }

    Engine.update(engine, 1000 / 60);

    // プレイヤー移動
    if (playerBody) {
        Body.setVelocity(playerBody, pTargetVel);
        const halfWidth = entityTemplates.player.width / 2;
        const halfHeight = entityTemplates.player.height / 2;
        const pos = playerBody.position;
        const clampedX = Math.max(halfWidth, Math.min(canvas.width - halfWidth, pos.x));
        const clampedY = Math.max(halfHeight, Math.min(canvas.height - halfHeight, pos.y));
        if (clampedX !== pos.x || clampedY !== pos.y) {
            Body.setPosition(playerBody, { x: clampedX, y: clampedY });
        }
    }

    // 描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        drawEntity(getRenderData(bullet));
        if (bullet.position.y > canvas.height + 50) {
            World.remove(world, bullet);
            bullets.splice(i, 1);
        }
    }
    if (playerBody) { drawEntity(getRenderData(playerBody)); }

    // スコア更新
    score = ((Date.now() - startTime) / 1000).toFixed(2);
    scoreDisplay.textContent = score;

    // デバッグ描画
    if (isDebugMode) { /* ... 省略 ... */ }

    // 次のループへ
    gameLoopRequestId = requestAnimationFrame(gameLoop);
}

// --- 衝突判定 ---
Events.on(engine, 'collisionStart', (event) => {
    if (gameOverFlag || !gameRunning) return;
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const bodyA = pair.bodyA; const bodyB = pair.bodyB;
        if (!bodyA || !bodyB || !bodyA.label || !bodyB.label) continue;
        if ((bodyA.label === 'player' && bodyB.label === 'bullet') ||
            (bodyA.label === 'bullet' && bodyB.label === 'player')) {
            console.log("Collision detected! Game Over.");
            gameRunning = false;
            gameOverFlag = true;
            gameOverText.textContent = `ゲームオーバー！\nスコア: ${score} 秒`;
            gameOverText.style.display = 'block';
            if(spawnTimer) clearInterval(spawnTimer); spawnTimer = null;
            if(difficultyTimer) clearInterval(difficultyTimer); difficultyTimer = null;
            if (gameLoopRequestId) { cancelAnimationFrame(gameLoopRequestId); gameLoopRequestId = null; }
            if(playerBody) Body.setVelocity(playerBody, {x:0, y:0});
            saveHighScore();
            displayHighScores();
            startButton.disabled = false;
            startButton.textContent = "もう一度！";
            resetButton.disabled = false;
            break;
        }
    }
});

// --- ボタンイベント ---
resetButton.addEventListener('click', () => {
     prepareGame();
});
startButton.addEventListener('click', () => {
    if (!gameRunning) {
         startGame();
    }
});

// --- ゲーム初期化・準備 ---
function prepareGame() { // initGameから名前変更
    console.log("Preparing game...");
    if (gameLoopRequestId) { cancelAnimationFrame(gameLoopRequestId); gameLoopRequestId = null; }
    if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
    if (difficultyTimer) { clearInterval(difficultyTimer); difficultyTimer = null; }

    World.clear(engine.world, false);
    Engine.clear(engine);

    bullets = [];
    playerBody = null;
    score = 0;
    gameOverFlag = false;
    gameRunning = false;
    gameOverText.style.display = 'none';
    keysPressed = {};

    // ⭐⭐ ここを修正！ オブジェクトのプロパティを書き換える方式に変更 ⭐⭐
    pTargetVel.x = 0;
    pTargetVel.y = 0;
    // ⭐⭐ spawnInterval = INITIAL_SPAWN_INTERVAL; は let なのでそのままでOKのはず！ ⭐⭐
    spawnInterval = INITIAL_SPAWN_INTERVAL;

    const pTemplate = entityTemplates.player;
    playerBody = Bodies.rectangle(canvas.width / 2, PLAYER_START_Y, pTemplate.width, pTemplate.height, {
        label: "player", frictionAir: 0.02, density: 0.01,
        inertia: Infinity, inverseInertia: 0, isStatic: true
    });
    playerBody.template = pTemplate;
    World.add(world, playerBody);

    loadHighScores();
    displayHighScores();
    scoreDisplay.textContent = "0.00";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (playerBody) drawEntity(getRenderData(playerBody));

    startButton.disabled = false;
    startButton.textContent = "スタート！";
    resetButton.disabled = false;

    console.log("Game prepared. Press Start!");
}

// --- ゲームを開始する関数 ---
function startGame() {
    if (gameRunning) return;
    console.log("Starting game!");
    bullets.forEach(b => World.remove(world, b)); // 古い弾を消す
    bullets = [];
    score = 0;
    startTime = Date.now();
    gameOverFlag = false;
    gameRunning = true;
    gameOverText.style.display = 'none';
    keysPressed = {};
    pTargetVel.x = 0; // 開始時もリセット
    pTargetVel.y = 0;
    spawnInterval = INITIAL_SPAWN_INTERVAL;

    if (!playerBody) { // プレイヤーがなければ作る
         const pTemplate = entityTemplates.player;
         playerBody = Bodies.rectangle(canvas.width / 2, PLAYER_START_Y, pTemplate.width, pTemplate.height, { label: "player", frictionAir: 0.02, density: 0.01, inertia: Infinity, inverseInertia: 0 });
         playerBody.template = pTemplate;
         World.add(world, playerBody);
    } else {
         Body.setStatic(playerBody, false); // 動けるように
         Body.setPosition(playerBody, { x: canvas.width / 2, y: PLAYER_START_Y });
         Body.setVelocity(playerBody, { x: 0, y: 0 });
         Body.setAngle(playerBody, 0);
    }

    if (spawnTimer) clearInterval(spawnTimer);
    if (difficultyTimer) clearInterval(difficultyTimer);
    startOrAdjustBulletSpawner();
    difficultyTimer = setInterval(startOrAdjustBulletSpawner, 5000);

    if (gameLoopRequestId) cancelAnimationFrame(gameLoopRequestId);
    gameLoopRequestId = requestAnimationFrame(gameLoop);

    startButton.disabled = true;
    startButton.textContent = "プレイ中...";
}


// --- 初期化処理 ---
if (!Array.prototype.random) {
    Array.prototype.random = function() {
        return this[(Math.random() * this.length) | 0];
    };
}
// gameLoopRequestId はグローバルで宣言済みなので不要

// スマホ用ボタンのセットアップ
setupMobileControls();

// --- 画像読み込み開始 ---
console.log("にゃんこ弾幕サバイバル！ 準備開始！");
preloadImages(); // 画像読み込み -> 完了したら prepareGame() が呼ばれる