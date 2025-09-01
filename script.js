// Get the custom cursor element
const cursor = document.getElementById('cursor');

// Track mouse position
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

// Update mouse position on move
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Smooth trailing animation
function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.2;
  cursorY += (mouseY - cursorY) * 0.2;
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Magnetic hover effect
const hoverTargets = document.querySelectorAll('button, a, h1, h2, h3');

hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
    cursor.style.filter = 'drop-shadow(0 0 5px #000)';
  });

  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.filter = 'none';
  });
});

