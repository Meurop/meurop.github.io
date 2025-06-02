// スイカ斬りゲーム！ 勇者の剣と、にこにこスイカちゃんの運命の出会い！

const gameWorld = document.getElementById('game-world');
const woodenStick = document.getElementById('wooden-stick'); // 心は勇者の剣！
const suika = document.getElementById('suika');
const hitButton = document.getElementById('hit-button');
const messageArea = document.getElementById('message-area');

let stickX = 0;
let stickY = 0;
let stickDX = 3;
let stickDY = 2;
let stickWidth = 0;
let stickHeight = 0;

let suikaX = 0;
let suikaY = 0;
let suikaWidth = 0;
let suikaHeight = 0;

let gameRunning = true;
let animationFrameId = null;

function setupGame() {
    gameRunning = true;
    messageArea.textContent = "剣とスイカちゃんが重なったらボタンを押してね！";
    hitButton.textContent = "えいっ！";
    suika.style.backgroundColor = '#66CDAA';
    suika.style.transform = 'none'; // もし前のゲームで変形させていたら元に戻すの

    stickWidth = woodenStick.offsetWidth;
    stickHeight = woodenStick.offsetHeight;
    suikaWidth = suika.offsetWidth;
    suikaHeight = suika.offsetHeight;

    stickX = gameWorld.offsetWidth / 2 - stickWidth / 2;
    stickY = gameWorld.offsetHeight / 2 - stickHeight / 2;
    woodenStick.style.left = stickX + 'px';
    woodenStick.style.top = stickY + 'px';

    stickDX = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 2 + 2.5);
    stickDY = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 2 + 2.0);

    placeSuika();

    if (!animationFrameId) {
        gameLoop();
    }
    console.log("「スイカ斬りゲーム！」の準備ができたわ！");
}

function placeSuika() {
    const maxX = gameWorld.offsetWidth - suikaWidth;
    const maxY = gameWorld.offsetHeight - suikaHeight;

    suikaX = Math.floor(Math.random() * maxX);
    suikaY = Math.floor(Math.random() * maxY);

    suika.style.left = suikaX + 'px';
    suika.style.top = suikaY + 'px';
    console.log(`にこにこスイカちゃんは X:${suikaX.toFixed(0)}, Y:${suikaY.toFixed(0)} に隠れたわ！`);
}

function gameLoop() {
    if (!gameRunning) {
        animationFrameId = null;
        return;
    }

    stickX += stickDX;
    stickY += stickDY;

    if (stickX + stickWidth > gameWorld.offsetWidth) {
        stickX = gameWorld.offsetWidth - stickWidth;
        stickDX *= -1;
    } else if (stickX < 0) {
        stickX = 0;
        stickDX *= -1;
    }

    if (stickY + stickHeight > gameWorld.offsetHeight) {
        stickY = gameWorld.offsetHeight - stickHeight;
        stickDY *= -1;
    } else if (stickY < 0) {
        stickY = 0;
        stickDY *= -1;
    }

    woodenStick.style.left = stickX + 'px';
    woodenStick.style.top = stickY + 'px';

    animationFrameId = requestAnimationFrame(gameLoop);
}

function checkHit() { // 「えいっ！」の瞬間の判定
    if (!gameRunning) {
        setupGame();
        return;
    }

    const stickRight = stickX + stickWidth;
    const stickBottom = stickY + stickHeight;
    const suikaRight = suikaX + suikaWidth;
    const suikaBottom = suikaY + suikaHeight;

    if (stickX < suikaRight && stickRight > suikaX &&
        stickY < suikaBottom && stickBottom > suikaY) {
        messageArea.textContent = "ズバッ！見事なスイカ斬り！クリアよ！🥳";
        suika.style.backgroundColor = '#FFD700';
        // スイカちゃんが斬られた感じを出す小さな魔法
        suika.style.transform = 'scale(0.8) rotate(45deg)';
        setTimeout(() => { // 少ししたら元に戻したり、消したりしてもいいわね
             if (gameRunning === false) { // まだクリア状態なら
                // placeSuika(); // 次のスイカを出すならここ
                // suika.style.display = 'none'; // 消すとか
             }
        }, 500);


        gameRunning = false;
        hitButton.textContent = "もう一度挑戦する？";
    } else {
        messageArea.textContent = "空振り！もう一度タイミングを計って！";
    }
}

// 「えいっ！」ボタンの魔法のかけ方を変えたわよ！
hitButton.addEventListener('pointerdown', checkHit); // ← ここが変わったの！'click' じゃなくて 'pointerdown' よ！

window.addEventListener('load', () => {
    stickWidth = woodenStick.offsetWidth;
    stickHeight = woodenStick.offsetHeight;
    suikaWidth = suika.offsetWidth;
    suikaHeight = suika.offsetHeight;
    setupGame();
});