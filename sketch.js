let mic, fft;
let vol = 0, smoothVol = 0;
let trails = [];
let ws;

function setup() {
  createCanvas(800, 480);
  background('#FAF3E0');

  mic = new p5.AudioIn();
  mic.start(() => {
    fft = new p5.FFT();
    fft.setInput(mic);
    console.log("🎤 마이크 준비 완료");
  });

  ws = new WebSocket("ws://172.30.1.72:8080");
  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data.vol !== undefined) vol = data.vol;
    } catch(e) {}
  };
}

function draw() {
  background('#FAF3E0');
  smoothVol = lerp(smoothVol, vol, 0.2);
  let baseRadius = height * 0.17;
  let radius = baseRadius + smoothVol * 300;

  let c = lerpColor(color('#D7E9F7'), color('#E63946'), constrain((radius - baseRadius)/baseRadius, 0, 1));

  let shapePoints = [];
  let noiseLevel = smoothVol * 400;
  for (let angle = 0; angle < TWO_PI; angle += 0.05) {
    let xoff = cos(angle) * 2 + frameCount * 0.01;
    let yoff = sin(angle) * 2 + frameCount * 0.01;
    let r = radius + (noise(xoff, yoff) - 0.5) * noiseLevel;
    shapePoints.push({ x: r * cos(angle), y: r * sin(angle) });
  }

  trails.push({ points: shapePoints, col: c, alpha: 200 });
  if (trails.length > 15) trails.shift();

  push();
  translate(width/2, height/2);
  for (let t of trails) {
    fill(red(t.col), green(t.col), blue(t.col), t.alpha);
    noStroke();
    beginShape();
    for (let p of t.points) vertex(p.x, p.y);
    endShape(CLOSE);
    t.alpha *= 0.9;
  }
  pop();
}

function windowResized() { resizeCanvas(800, 480); }
