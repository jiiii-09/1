let mic, fft;
let vol = 0;
let smoothVol = 0;
let trails = [];
let started = false; // 👈 클릭 전엔 마이크 비활성

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#FAF3E0');
  textAlign(CENTER, CENTER);
  textSize(20);
  fill('#333');
  text("🎤 클릭해서 마이크 시작", width / 2, height / 2);
}

function draw() {
  if (!started || !mic || !fft) return; // 👈 아직 시작 안 했으면 대기

  background('#FAF3E0');

  vol = mic.getLevel();
  smoothVol = lerp(smoothVol, vol, 0.2);

  let baseRadius = height * 0.17;
  let radius = baseRadius + smoothVol * 300;

  let c = lerpColor(
    color('#D7E9F7'),
    color('#E63946'),
    constrain((radius - baseRadius) / baseRadius, 0, 1)
  );

  // --- 현재 원의 모양을 trail로 저장 ---
  let shapePoints = [];
  let noiseLevel = smoothVol * 400;
  for (let angle = 0; angle < TWO_PI; angle += 0.07) {
    let xoff = cos(angle) * 2 + frameCount * 0.01;
    let yoff = sin(angle) * 2 + frameCount * 0.01;
    let r = radius + (noise(xoff, yoff) - 0.5) * noiseLevel;
    let x = r * cos(angle);
    let y = r * sin(angle);
    shapePoints.push({ x, y });
  }

  trails.push({ points: shapePoints, col: c, alpha: 200 });
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

function mousePressed() {
  if (!started) {
    userStartAudio(); // 👈 p5.js 오디오 초기화 (보안 요구사항)
    mic = new p5.AudioIn();
    mic.start(onMicStart, onMicError);
    started = true;
  }
}

function onMicStart() {
  console.log("🎤 마이크 준비 완료");
  fft = new p5.FFT();
  fft.setInput(mic);
}

function onMicError(err) {
  console.error("🚫 마이크 연결 실패:", err);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
