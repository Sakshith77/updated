// ========== CUSTOM CURSOR ==========
const cursor = document.getElementById('cursor');
if (cursor) {
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth trailing animation
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15; // Adjust for smoother motion
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Fade in cursor on load
  window.addEventListener('load', () => {
    cursor.style.opacity = '1';
  });

  // Magnetic hover effect
  const hoverTargets = document.querySelectorAll('button, a, h1, h2, h3');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursor.style.filter = 'drop-shadow(0 0 5px #000)';
    });
    el.addEventListener('mouseleave', () => {
      setTimeout(() => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.filter = 'none';
      }, 100);
    });
  });
}

// ========== DARK MODE TOGGLE ==========
const toggle = document.getElementById("darkToggle");
const isDark = localStorage.getItem("darkMode") === "true";

// Apply saved preference
if (isDark) {
  document.body.classList.add("dark-mode");
  toggle.innerText = "☀️";
}

// Toggle and save preference
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const active = document.body.classList.contains("dark-mode");
  toggle.innerText = active ? "☀️" : "🌙";
  localStorage.setItem("darkMode", active);
});

// ========== QUOTE ROTATOR ==========
const quotes = [
  "Music is the divine way to tell beautiful things to the heart.",
  "Mythology is not a lie, it’s a poetic truth.",
  "Philosophy begins in wonder.",
  "Let your curiosity guide you, and your passion shape the pixels."
];

let i = 0;
setInterval(() => {
  const quoteBox = document.getElementById("quoteBox");
  if (quoteBox) {
    quoteBox.textContent = quotes[i];
    i = (i + 1) % quotes.length;
  }
}, 4000);


// ========== TYPED.JS INIT ==========
setTimeout(() => {
  new Typed("#typed", {
    strings: ["Sakshith's Knowledge Hub", "Explore Music & Mythology"],
    typeSpeed: 50,
    backSpeed: 50,
    loop: true
  });
}, 300); // Slight delay for smoother load

// ========== AOS INIT ==========
setTimeout(() => {
  AOS.init();
}, 300);











const cacheName = 'v1';
const cachedFiles = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/images/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(cachedFiles))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
