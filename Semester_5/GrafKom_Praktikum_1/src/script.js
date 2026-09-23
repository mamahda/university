const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cHeight = 600;
const cWidth = 800;

const radius = 50;

let locX = 100;
let locY = 200;

let velocity = 0;
const gravity = 0.5;
const bounce = 0.8;

function update() {
  velocity += gravity;

  locY += velocity;

  if (locY >= cHeight - radius) {
    locY = cHeight - radius;
    velocity = -velocity * bounce;
  }
}

function draw() {
  ctx.beginPath();

  ctx.arc(
    locX,
    locY,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "red";
  ctx.fill();
}

function animate() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  update();
  draw();

  requestAnimationFrame(animate);
}

animate();