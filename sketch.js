let mic, fft;
let vol = 0, smoothVol = 0;
let trails = [];
let enteredFullscreen = false;

let socket;
let isSender = false; // 마이크 있는 쪽은 자동으로 송신자됨
let remoteVol = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#FAF3E0');
  textAlign(CENTER, CENTER);
  textSize(28);
  fill(100);
  text("화면을 터치해서 시작하세요 🎤", width / 2, height / 2);

  // ✅ WebSocket 연결
  socket = new WebSocket("ws://172.30.1.72:8080");

  socket.onopen = () => {
    console.log("✅ WebSocket 연결 성공");
  };

  socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
    if (data.volume !== undefined) {
      remoteVol = data.volume;
    }
  };

  socket.onerror = (err) => {
    console.error("🚨 WebSocket 오류:", err);
  };

  // 🎤 마이크 시도 (모바일에선 권한 없을 수도 있음)
  mic = new p5.AudioIn();
  mic.start(
    () => {
      console.log("🎤 마이크 활성화됨 → 송신자 역할");
      isSender = true;
      fft = new p5.FFT();
      fft.setInput(mic);
    },
    (err) => {
      console.warn("❌ 마이크 권한 없음 → 수신자 역할 전환", err);
      isSender = false;
    }
  );
}

function draw() {
  if (!enteredFullscreen) return;

  background('#FAF3E0');

  // --- 송신자: 마이크 데이터 전송 ---
  if (isSender && mic.enabled && fft) {
    vol = mic.getLevel();
    smoothVol = lerp(smoothVol, vol, 0.2);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ volume: smoothVol }));
    }
  }

  // --- 수신자: 서버에서 받은 볼륨으로 업데이트 ---
  if (!isSender) {
    smoothVol = lerp(smoothVol, remoteVol, 0.2);
  }

  // --- 시각화 공통 부분 ---
  let baseRadius = height * 0.17;
  let radius = baseRadius + smoothVol * 300;
  let c = lerpColor(
    color('#D7E9F7'),
    color('#E63946'),
    constrain((radius - baseRadius) / baseRadius, 0, 1)
  );

  let shapePoints = [];
  let noiseLevel = smoothVol * 400;
  for (let angle = 0; angle < TWO_PI; angle += 0.05) {
    let xoff = cos(angle) * 2 + frameCount * 0.01;
    let yoff = sin(angle) * 2 + frameCount * 0.01;
    let r = radius + (noise(xoff, yoff) - 0.5) * noiseLevel;
    let x = r * cos(angle);
    let y = r * sin(angle);
    shapePoints.push({ x, y });
  }

  trails.push({ points: shapePoints, col: c, alpha: 200 });
  if (trails.length > 15) trails.shift();

  push();
  translate(width / 2, height / 2);
  for (let i = 0; i < trails.length; i++) {
    let t = trails[i];
    fill(red(t.col), green(t.col), blue(t.col), t.alpha);
    noStroke();
    beginShape();
    for (let p of t.points) vertex(p.x * (1 + i * 0.05), p.y * (1 + i * 0.05));
    endShape(CLOSE);
    t.alpha *= 0.9;
  }
  pop();
}

// --- 전체화면 ---
function touchStarted() {
  enterFullscreenOnce();
  return false;
}
function mousePressed() {
  enterFullscreenOnce();
}
function enterFullscreenOnce() {
  if (!enteredFullscreen) {
    fullscreen(true);
    enteredFullscreen = true;
    noCursor();
    background('#FAF3E0');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background('#FAF3E0');
}
