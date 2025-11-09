let mic;
let fft;
let vol = 0;
let smoothVol = 0;
let trails = [];
let enteredFullscreen = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#FAF3E0');

  textAlign(CENTER, CENTER);
  textSize(28);
  fill(100);
  text("화면을 터치해서 시작하세요 🎤", width / 2, height / 2);

  mic = new p5.AudioIn();
  mic.start(onMicStart, onMicError);
}

function onMicStart() {
  console.log("🎤 마이크 준비 완료");
  fft = new p5.FFT();
  fft.setInput(mic);
}

function onMicError(err) {
  console.error("🚫 마이크 연결 실패:", err);
}

function draw() {
  if (!enteredFullscreen) return; // 아직 전체화면 전환 전이면 대기

  background('#FAF3E0');

  if (mic.enabled && fft) {
    vol = mic.getLevel();
    smoothVol = lerp(smoothVol, vol, 0.2);

    let baseRadius = height * 0.17; // 원 기본 크기 (화면 크기에 비례)
    let radius = baseRadius + smoothVol * 300;

    let c = lerpColor(
      color('#D7E9F7'),
      color('#E63946'),
      constrain((radius - baseRadius) / baseRadius, 0, 1)
    );

    // --- 현재 원의 모양을 trail로 저장 ---
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

    // trail 개수 제한
    if (trails.length > 15) trails.shift();

    // --- 잔상 그리기 ---
    push();
    translate(width / 2, height / 2);
    for (let i = 0; i < trails.length; i++) {
      let t = trails[i];
      fill(red(t.col), green(t.col), blue(t.col), t.alpha);
      noStroke();
      beginShape();
      for (let p of t.points) {
        vertex(p.x * (1 + i * 0.05), p.y * (1 + i * 0.05));
      }
      endShape(CLOSE);

      t.alpha *= 0.9;
    }
    pop();
  }
}

// --- 터치 or 클릭 시 한 번만 전체화면 진입 + 커서 숨김 ---
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
  resizeCanvas(windowWidth, windowHeight); // ✅ 반응형 유지
  background('#FAF3E0');
}
