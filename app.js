let typingData = {};

// Load JSON
fetch("typing.json")
  .then(res => res.json())
  .then(data => typingData = data);

// PAGE 1
function homePage() {
  return `
    <div class="container">
      <div class="input-box">
        <h2>Enter Your Name</h2>
        <input id="name">
        <br>
        <button onclick="saveName()">Next</button>
      </div>
    </div>
  `;
}

// PAGE 2
function modePage() {
  return `
    <div class="container">
      <div class="card" onclick="selectMode('practice')">Practice Mode</div>
      <div class="card" onclick="selectMode('expert')">Government Exam</div>
    </div>
  `;
}

// PAGE 3
function languagePage() {
  return `
    <div class="container">
      <div class="card" onclick="selectLanguage('english')">English</div>
      <div class="card" onclick="selectLanguage('hindi')">Hindi</div>
    </div>
  `;
}

// PAGE 4
function fontPage() {
  return `
    <div class="container">
      <div class="card" onclick="selectFont('mangal')">Mangal</div>
      <div class="card" onclick="selectFont('krutidev')">KrutiDev</div>
      <div class="card" onclick="selectFont('devlys')">Devlys</div>
      <div class="card" onclick="selectFont('remington')">Remington</div>
    </div>
  `;
}

// PAGE 5
function practicePage() {
  let list = "";
  for (let i = 1; i <= 10; i++) {
    list += `<div class="list-item" onclick="selectPractice(${i}, this)">Practice ${i}</div>`;
  }

  return `
    <div class="practice-container">
      <div class="left">${list}</div>

      <div class="center">
        <p id="practiceText">Select Practice</p>
      </div>

      <div class="right">
        <select id="time">
          <option value="">Select Time</option>
          <option value="1">1 Min</option>
          <option value="2">2 Min</option>
          <option value="5">5 Min</option>
        </select>

        <br><br>
        <button onclick="startPractice()">Next</button>
      </div>
    </div>
  `;
}

// PAGE 6
function testPage() {
  const text = localStorage.getItem("text");
  const font = localStorage.getItem("font") || "";
  const fontClass = font === "krutidev" ? "krutidev" : "";

  return `
    <div class="practice-container">

      <div class="left">
        <p id="testText" class="${fontClass}">${text}</p>
      </div>

      <div class="center">
        <textarea id="typingInput" placeholder="Start typing..." oninput="checkTyping()"></textarea>
        <br><br>
        <button onclick="finishTest()">Finish</button>
      </div>

      <div class="right">
        <canvas id="speedometer" width="200" height="200"></canvas>
        <h3>Speed: <span id="speed">0</span> WPM</h3>
        <h3>Accuracy: <span id="accuracy">100</span>%</h3>
        <h3>Time: <span id="timer">0</span>s</h3>
      </div>

    </div>
  `;
}

// FUNCTIONS
function saveName() {
  localStorage.setItem("name", document.getElementById("name").value);
  navigate("mode");
}

function selectMode(mode) {
  localStorage.setItem("mode", mode);
  navigate("language");
}

function selectLanguage(lang) {
  localStorage.setItem("language", lang);
  if (lang === "hindi") navigate("font");
  else navigate("practice");
}

function selectFont(font) {
  localStorage.setItem("font", font);
  navigate("practice");
}

function selectPractice(p, el) {

  const lang = localStorage.getItem("language") || "english";
  const mode = localStorage.getItem("mode") || "practice";

  let text;

  if (mode === "expert") {
    text = typingData.exam[lang][p % typingData.exam[lang].length];
  } else {
    text = typingData.practice[lang][p - 1];
  }

  localStorage.setItem("text", text);

  document.getElementById("practiceText").innerText = text;

  document.querySelectorAll(".list-item").forEach(i => i.classList.remove("active-practice"));
  el.classList.add("active-practice");
}

function startPractice() {
  const time = document.getElementById("time").value;
  if (!time) return alert("Select time");

  localStorage.setItem("time", time);
  navigate("test");
}

// TYPING
let startTime, timerInterval;

function startTimer() {
  let time = parseInt(localStorage.getItem("time")) * 60;
  startTime = Date.now();

  timerInterval = setInterval(() => {
    let elapsed = Math.floor((Date.now() - startTime) / 1000);
    let remaining = time - elapsed;

    document.getElementById("timer").innerText = remaining;

    if (remaining <= 0) finishTest();
  }, 1000);
}

function checkTyping() {
  const text = document.getElementById("testText").innerText;
  const input = document.getElementById("typingInput").value;

  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === text[i]) correct++;
  }

  let accuracy = Math.floor((correct / input.length) * 100) || 0;
  document.getElementById("accuracy").innerText = accuracy;

  let time = (Date.now() - startTime) / 60000;
  let words = input.length / 5;
  let speed = Math.floor(words / time) || 0;

  document.getElementById("speed").innerText = speed;

  drawSpeed(speed);
}

function drawSpeed(speed) {
  const canvas = document.getElementById("speedometer");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.arc(100, 100, 80, Math.PI, 2 * Math.PI);
  ctx.stroke();

  for (let i = 0; i <= 100; i += 20) {
    let angle = Math.PI + (i / 100) * Math.PI;
    let x = 100 + 70 * Math.cos(angle);
    let y = 100 + 70 * Math.sin(angle);
    ctx.fillText(i, x - 10, y);
  }

  let angle = Math.PI + (speed / 100) * Math.PI;

  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(100 + 70 * Math.cos(angle), 100 + 70 * Math.sin(angle));
  ctx.stroke();
}

function finishTest() {
  clearInterval(timerInterval);

  const speed = document.getElementById("speed").innerText;
  const accuracy = document.getElementById("accuracy").innerText;
  const name = localStorage.getItem("name");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  doc.setDrawColor(255, 215, 0);
  doc.setLineWidth(5);
  doc.rect(10, 10, 270, 180);

  doc.setFontSize(24);
  doc.text("Certificate of Accomplishment", 60, 40);

  doc.text("Awarded to:", 120, 60);
  doc.text(name || "User", 120, 80);

  doc.text("Speed: " + speed + " WPM", 60, 130);
  doc.text("Accuracy: " + accuracy + "%", 180, 130);

  doc.save("certificate.pdf");
}

// ROUTES
const routes = {
  home: homePage,
  mode: modePage,
  language: languagePage,
  font: fontPage,
  practice: practicePage,
  test: testPage
};

function navigate(page) {
  window.location.hash = page;
  render();
}

function render() {
  const page = window.location.hash.replace("#", "") || "home";
  document.getElementById("app").innerHTML = routes[page]();

  if (page === "test") setTimeout(startTimer, 100);
}

function toggleMenu() {
  document.getElementById("menu").classList.toggle("active");
}

window.addEventListener("load", render);
window.addEventListener("hashchange", render);