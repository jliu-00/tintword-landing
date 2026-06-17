// Language State
let currentLang = 'en';

const cardsData = [
  { pos: "adj", word: "wunderschön", translation: { en: "gorgeous", zh: "极美的" }, forms: "" },
  { pos: "verb", word: "abfahren", translation: { en: "to depart", zh: "启程" }, forms: "fährt ab, fuhr ab, ist abgefahren" },
  { pos: "das", word: "das Fernweh", translation: { en: "Wanderlust", zh: "远方之思" }, forms: "" },
  { pos: "die", word: "die Kultur", translation: { en: "Culture", zh: "文化" }, forms: "" },
  { pos: "der", word: "der Wortschatz", translation: { en: "Vocabulary", zh: "词汇" }, forms: "die Wortschätze" },
];

const container = document.getElementById('cards-container');

// Language Toggle Logic
const btnEn = document.getElementById('btn-en');
const btnZh = document.getElementById('btn-zh');

function updateLanguage(lang) {
  currentLang = lang;
  
  if (lang === 'en') {
    btnEn.classList.add('active');
    btnZh.classList.remove('active');
  } else {
    btnZh.classList.add('active');
    btnEn.classList.remove('active');
  }

  // Update static text elements with data attributes
  document.querySelectorAll('[data-en][data-zh]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });

  // Re-render cards to update translations
  initCards();
}

btnEn.addEventListener('click', () => updateLanguage('en'));
btnZh.addEventListener('click', () => updateLanguage('zh'));

function createCard(data) {
  const el = document.createElement('div');
  el.className = 'vocab-card';
  el.setAttribute('data-pos', data.pos);
  
  // Prevent native drag-and-drop which interrupts pointer events
  el.addEventListener('dragstart', (e) => e.preventDefault());
  
  let labelEn = '';
  let labelZh = '';
  switch(data.pos) {
    case 'der': labelEn = 'Masculine'; labelZh = '阳性名词'; break;
    case 'die': labelEn = 'Feminine'; labelZh = '阴性名词'; break;
    case 'das': labelEn = 'Neuter'; labelZh = '中性名词'; break;
    case 'verb': labelEn = 'Verb'; labelZh = '动词'; break;
    case 'adj': labelEn = 'Adjective'; labelZh = '形容词'; break;
  }

  el.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <span class="atlas-label" data-en="${labelEn}" data-zh="${labelZh}">${currentLang === 'zh' ? labelZh : labelEn}</span>
        <h2 class="card-word">${data.word}</h2>
      </div>
      <div class="card-back">
        <span class="atlas-label" data-en="${labelEn}" data-zh="${labelZh}">${currentLang === 'zh' ? labelZh : labelEn}</span>
        <h2 class="card-word" style="font-size: 2rem; margin-bottom: 0.5rem;">${data.word}</h2>
        <div class="card-translated">${data.translation[currentLang]}</div>
        ${data.forms ? `<div class="card-forms">${data.forms}</div>` : ''}
      </div>
    </div>
  `;
  
  // Swipe Logic
  let isDragging = false;
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;

  function handlePointerDown(e) {
    // Only accept primary button (left click) or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    currentX = 0;
    currentY = 0;
    
    el.classList.add('dragging');
    
    // Bind global events for robust tracking
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
    window.addEventListener('lostpointercapture', handlePointerEnd);
    
    try {
      el.setPointerCapture(e.pointerId);
    } catch(err) {}

    // Apply initial scale down
    el.style.transform = `translate3d(0, 0, 0) rotate(0deg) scale(0.95)`;
  }

  function handlePointerMove(e) {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;

    // Apply translation, slight rotation, and scale down based on X movement
    const rotation = currentX * 0.05;
    el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${rotation}deg) scale(0.95)`;
  }

  function handlePointerEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    el.classList.remove('dragging');
    
    // Remove global events
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerEnd);
    window.removeEventListener('pointercancel', handlePointerEnd);
    window.removeEventListener('lostpointercapture', handlePointerEnd);

    try {
      if (e && e.pointerId) {
        el.releasePointerCapture(e.pointerId);
      }
    } catch(err) {}

    // Check if it was a tap instead of a swipe
    const dist = Math.sqrt(currentX * currentX + currentY * currentY);
    if (dist < 10) {
      el.classList.toggle('is-flipped');
      el.style.transform = `translate3d(0, 0, 0) rotate(0deg) scale(1)`;
      currentX = 0;
      currentY = 0;
      return;
    }

    // classifySwipe logic threshold
    const threshold = Math.min(window.innerWidth * 0.25, 120);

    if (dist > threshold) {
      // Swiped far enough - fly out
      const flyMultiplier = window.innerWidth / Math.abs(currentX || 1);
      const flyX = currentX * flyMultiplier;
      const flyY = currentY * flyMultiplier;
      
      el.style.transform = `translate3d(${flyX}px, ${flyY}px, 0) rotate(${currentX * 0.1}deg) scale(0.95)`;
      el.style.opacity = '0';
      el.style.pointerEvents = 'none'; // Prevent any further interactions
      
      // Remove element after transition
      setTimeout(() => {
        if (el.parentNode) {
          el.remove();
          checkEmpty();
        }
      }, 300);
    } else {
      // Didn't swipe far enough - snap back and bounce up to original size
      el.style.transform = `translate3d(0, 0, 0) rotate(0deg) scale(1)`;
    }
    
    currentX = 0; 
    currentY = 0;
  }

  // Only listen to down on the element itself
  el.addEventListener('pointerdown', handlePointerDown);

  return el;
}

function initCards() {
  container.innerHTML = '';
  // Append in reverse order so the first item in the array is visually on top of the stack
  [...cardsData].reverse().forEach(data => {
    container.appendChild(createCard(data));
  });
}

function checkEmpty() {
  if (container.children.length === 0) {
    // Re-initialize cards after a short delay for endless swiping demo
    setTimeout(initCards, 600);
  }
}

// Initialize on load
initCards();
