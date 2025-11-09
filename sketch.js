let vol = 0;
let smoothVol = 0;
let trails = [];
let enteredFullscreen = false;
let ws;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#FAF3E0');

  textAlign(CENTER, CENTER);
  textSize(28);
  fill(100);
  text("화면을 터치해서 시작하세요 🎤", width / 2, height / 2);

  // WebSocket 연결
  ws = new WebSocket("ws://172.30.1.72:8080"); // 서버 IP 확인
  ws.onopen = () => console.log("📡 WebSocket 연결 성공 ✅");
  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data.vol !== undefined) vol = data.vol;
    } catch(e) {}
  };
}

function draw() {
  if (!enteredFullscreen) return;

  background('#FAF3E0');

  smoothVol = lerp(smoothVol, vol, 0.2);
  let baseRadius = height * 0.17;
  let radius = baseRadius + smoothVol * 300;

  let c = lerpColor(color('#D7E9F7'), color('#E63946'),
                    constrain((radius - baseRadius)/baseRadius, 0, 1));

  push();
  translate(width/2, height/2);
  fill(c);
  noStroke();
  ellipse(0, 0, radius*2, radius*2);
  pop();
}

// 터치/클릭 → 전체화면
function touchStarted() { enterFullscreenOnce(); return false; }
function mousePressed() { enterFullscreenOnce(); }

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
</script>
</body>
</html>
