// app.js
(() => {
  const $ = (id) => document.getElementById(id);

  const input = $('tts-input');
  const btnSpeak = $('btn-speak');
  const btnPause = $('btn-pause');
  const btnResume = $('btn-resume');
  const btnStop = $('btn-stop');
  const voiceSelect = $('voice-select');
  const rateEl = $('rate');
  const pitchEl = $('pitch');

  const timeline = $('timeline');
  const progressEl = $('timeline-progress');
  const thumbEl = $('timeline-thumb');
  const statusEl = $('tts-status');
  const previewEl = $('tts-preview');

  let voices = [];
  let utterance = null;
  let currentIndex = 0;     // absolute char index in original textg
  let isDragging = false;
  let textCache = '';

  // Load voices
  function loadVoices() {
    voices = window.speechSynthesis.getVoices() || [];
    voiceSelect.innerHTML = '';
    voices.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${v.name} (${v.lang})${v.default ? ' — default' : ''}`;
      voiceSelect.appendChild(opt);
    });
    // Try to preselect an English/Indian voice for Hyderabad context if present
    const preferred = voices.findIndex(v => /en-IN/i.test(v.lang)) >= 0
      ? voices.findIndex(v => /en-IN/i.test(v.lang))
      : voices.findIndex(v => /en/i.test(v.lang));
    if (preferred >= 0) voiceSelect.value = preferred;
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  } else {
    statusEl.textContent = 'Your browser does not support speech synthesis.';
  }

  // Helpers
  function setStatus(s) { statusEl.textContent = s; }
  function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }

  function updateTimelineFromIndex(idx) {
    const len = textCache.length;
    const pct = len ? (idx / len) * 100 : 0;
    progressEl.style.width = `${pct}%`;
    thumbEl.style.left = `${pct}%`;
    thumbEl.setAttribute('aria-valuenow', Math.round(pct));
  }

  function highlightPreview(idx) {
    const t = textCache;
    if (!t || idx >= t.length) { previewEl.textContent = t; return; }
    const start = idx;

    // Find word boundaries
    const before = t.slice(0, start);
    const rest = t.slice(start);
    const match = rest.match(/^\S+/); // word from current index
    const word = match ? match[0] : '';
    const after = rest.slice(word.length);

    // Basic escape to avoid HTML injection
    const esc = (s) => s.replace(/[&<>"']/g, (c) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));

    previewEl.innerHTML = `${esc(before)}<mark>${esc(word)}</mark>${esc(after)}`;
  }

  function createUtteranceSlice(startIndex = 0) {
    const sliceText = textCache.slice(startIndex);
    const u = new SpeechSynthesisUtterance(sliceText);

    const v = voices[voiceSelect.value] || voices[0];
    if (v) u.voice = v;
    u.rate = parseFloat(rateEl.value || '1');
    u.pitch = parseFloat(pitchEl.value || '1');

    u.onstart = () => setStatus('Speaking...');
    u.onend = () => {
      setStatus('Finished');
      currentIndex = textCache.length;
      updateTimelineFromIndex(currentIndex);
      highlightPreview(currentIndex);
    };
    u.onerror = (e) => {
      console.error('Speech error', e);
      setStatus('Error during speech');
    };

    // Boundary events give charIndex relative to the utterance text
    u.onboundary = (e) => {
      if (typeof e.charIndex === 'number') {
        currentIndex = startIndex + e.charIndex;
        updateTimelineFromIndex(currentIndex);
        highlightPreview(currentIndex);
      }
    };

    return u;
  }

  function speakFrom(index = 0) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    currentIndex = clamp(index, 0, textCache.length);
    utterance = createUtteranceSlice(currentIndex);
    window.speechSynthesis.speak(utterance);
    updateTimelineFromIndex(currentIndex);
    highlightPreview(currentIndex);
  }

  // Controls
  btnSpeak.addEventListener('click', () => {
    textCache = input.value.trim();
    if (!textCache) { setStatus('Enter some text to speak'); return; }
    speakFrom(0);
  });

  btnPause.addEventListener('click', () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setStatus('Paused');
    }
  });

  btnResume.addEventListener('click', () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus('Speaking...');
    }
  });

  btnStop.addEventListener('click', () => {
    window.speechSynthesis.cancel();
    setStatus('Stopped');
  });

  // Seeking via timeline
  function seekFromClientX(clientX) {
    const rect = timeline.querySelector('.timeline-track').getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const pct = x / rect.width;
    const targetIndex = Math.floor(pct * (textCache.length || 0));
    updateTimelineFromIndex(targetIndex);
    highlightPreview(targetIndex);
    return targetIndex;
  }

  timeline.addEventListener('mousedown', (e) => {
    isDragging = true;
    const idx = seekFromClientX(e.clientX);
    if (textCache) speakFrom(idx);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    seekFromClientX(e.clientX);
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const idx = seekFromClientX(e.clientX);
    if (textCache) speakFrom(idx);
  });

  // Keyboard accessibility for timeline thumb
  thumbEl.tabIndex = 0;
  thumbEl.addEventListener('keydown', (e) => {
    if (!textCache) return;
    const len = textCache.length;
    const step = Math.max(1, Math.floor(len * 0.01)); // 1% step
    if (e.key === 'ArrowRight') {
      const idx = clamp(currentIndex + step, 0, len);
      speakFrom(idx);
    } else if (e.key === 'ArrowLeft') {
      const idx = clamp(currentIndex - step, 0, len);
      speakFrom(idx);
    }
  });

  // Live-highlight even before speaking
  input.addEventListener('input', () => {
    textCache = input.value;
    currentIndex = clamp(currentIndex, 0, textCache.length);
    updateTimelineFromIndex(currentIndex);
    highlightPreview(currentIndex);
    setStatus('Idle');
  });

  // Initialize preview
  textCache = input.value;
  updateTimelineFromIndex(0);
  highlightPreview(0);
})();
