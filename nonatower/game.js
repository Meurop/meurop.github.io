// Face Stack - シンプル積み顔ゲーム
// 使い方: faces/list.json に画像ファイル名を並べ、faces/ 配下にPNGを置く

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W = 800, H = 600;
canvas.width = W; canvas.height = H;

let faces = []; // Image objects
let faceNames = [];
let loaded = false;
let stack = []; // placed faces
let active = null; // currently controllable face
let gravity = 0.5;
let groundY = H - 40;
let score = 0;
let best = 0;
let running = false;

async function loadFaceList(){
  try{
    const res = await fetch('faces/list.json');
    faceNames = await res.json();
    await Promise.all(faceNames.map(async (name)=>{
      const img = new Image();
      img.src = 'faces/' + name;
      await new Promise((res,rej)=>{img.onload=res;img.onerror=rej});
      faces.push(img);
    }));
    loaded = true;
    console.log('faces loaded', faces.length);
    const btn = document.getElementById('startBtn');
    if(btn){ btn.disabled = false; }
    const status = document.getElementById('status');
    if(status){ status.textContent = `読み込み完了: ${faces.length} 枚`; status.className = 'status ok'; }
  }catch(e){
    console.error('failed to load faces', e);
    // keep start disabled and alert user
    const btn = document.getElementById('startBtn');
    if(btn) btn.disabled = true;
    const status = document.getElementById('status');
    if(status){ status.textContent = '画像の読み込みに失敗しました。faces/list.json と faces/ フォルダを確認してください。console を確認してください。'; status.className = 'status error'; }
  }
}

function randFace(){
  if(faces.length===0) return null;
  return faces[Math.floor(Math.random()*faces.length)];
}

function startGame(){
  // Prevent starting if no faces are loaded (common when opening via file:// or list.json missing)
  if(faces.length === 0){
    const status = document.getElementById('status');
    if(status) status.textContent = '画像未読込のため開始できません。faces/list.json と faces/ を確認してください。';
    alert('画像が読み込まれていません。\nfaces/list.json と faces/ フォルダを確認するか、ローカルサーバーで開いてください。');
    return;
  }

  stack = [];
  score = 0;
  running = true;
  spawnFace();
}

function resetGame(){
  stack = [];
  active = null;
  score = 0;
  running = false;
}

function spawnFace(){
  const img = randFace();
  if(!img) return;
  const size = 64 + Math.random()*40; // varied size
  active = {
    img: img,
    x: W/2,
    y: 60,
    vx: 0,
    vy: 0,
    rot: 0,
    vrot: 0,
    w: size,
    h: size,
    mass: size/30
  };
}

function update(){
  if(!running) return;
  if(active){
    // apply gravity
    active.vy += gravity * active.mass * 0.02;
    active.y += active.vy;
    active.x += active.vx;
    active.rot += active.vrot;

    // floor collision
    if(active.y + active.h/2 >= groundY){
      // snap to ground or stack
      active.y = groundY - active.h/2;
      settleActive();
    } else {
      // check collision with stack
      for(let i=stack.length-1;i>=0;i--){
        const s = stack[i];
        if(aabbCollide(active, s)){
          // place on top of s
          active.y = s.y - s.h/2 - active.h/2 + 2; // small overlap
          active.vy = 0;
          active.vx = s.vx*0.5;
          active.vrot = (Math.random()-0.5)*0.05;
          settleActive();
          break;
        }
      }
    }

    // boundary checks
    if(active.x - active.w/2 < 0) active.x = active.w/2;
    if(active.x + active.w/2 > W) active.x = W - active.w/2;

    // if falling too far outside
    if(active.y - active.h/2 > H + 200){
      // game over
      running = false;
      active = null;
    }
  }
}

function settleActive(){
  // add to stack
  const placed = Object.assign({}, active);
  placed.vx = active.vx;
  placed.vy = 0;
  placed.vrot = active.vrot;
  stack.push(placed);
  score = stack.length;
  document.getElementById('score').textContent = score;
  if(score > best){ best = score; document.getElementById('best').textContent = best; localStorage.setItem('face_best', best); }
  active = null;
  // spawn next after short delay
  setTimeout(()=>{ spawnFace(); }, 300);
}

function aabbCollide(a,b){
  return !(a.x + a.w/2 < b.x - b.w/2 || a.x - a.w/2 > b.x + b.w/2 || a.y + a.h/2 < b.y - b.h/2 || a.y - a.h/2 > b.y + b.h/2);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  // background
  ctx.fillStyle = '#a6d4c8';
  ctx.fillRect(0,0,W,H);
  // ground
  ctx.fillStyle = '#6a5f4a';
  ctx.fillRect(0,groundY, W, H-groundY);

  // draw stack
  for(const p of stack){
    drawFace(p);
  }
  // draw active
  if(active) drawFace(active);

  requestAnimationFrame(draw);
}

function drawFace(p){
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.drawImage(p.img, -p.w/2, -p.h/2, p.w, p.h);
  ctx.restore();
}

// input
let leftDown=false, rightDown=false;
window.addEventListener('keydown', (e)=>{
  if(e.code === 'ArrowLeft') leftDown=true;
  if(e.code === 'ArrowRight') rightDown=true;
  if(e.code === 'Space'){
    if(!running) startGame(); else if(active) { active.vy = 6; }
  }
});
window.addEventListener('keyup', (e)=>{
  if(e.code === 'ArrowLeft') leftDown=false;
  if(e.code === 'ArrowRight') rightDown=false;
});

// mouse/touch for moving
canvas.addEventListener('mousemove', (e)=>{
  // optional: control active by mouse
});

function inputUpdate(){
  if(active){
    if(leftDown) active.x -= 3;
    if(rightDown) active.x += 3;
  }
}

// load best
(function(){ const b = localStorage.getItem('face_best'); if(b) { best = parseInt(b); document.getElementById('best').textContent = best; }})();

// main loop
setInterval(update, 20);
requestAnimationFrame(draw);
setInterval(inputUpdate, 20);

// UI
document.getElementById('startBtn').addEventListener('click', ()=>{ if(!running) startGame(); });
document.getElementById('resetBtn').addEventListener('click', ()=>{ resetGame(); document.getElementById('score').textContent = 0; });

// initialize
loadFaceList().then(()=>{ console.log('loaded'); });
