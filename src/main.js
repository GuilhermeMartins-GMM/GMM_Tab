import './style.css';

const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env) 
  ? import.meta.env.VITE_NASA_API_KEY 
  : 'DEMO_KEY';

const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;

const appElement = document.querySelector('#app');
const btnNasa = document.querySelector('#btn-nasa');
const calcElement = document.querySelector('#calc-app');
const btnCalc = document.querySelector('#btn-calc');

const calcScreen = document.querySelector('#calc-screen');
const numButtons = document.querySelectorAll('.btn-num');
const opButtons = document.querySelectorAll('.btn-op');
const clearButton = document.querySelector('.btn-clear');
const backButton = document.querySelector('.btn-back');
const equalButton = document.querySelector('#btn-equal');

let currentExpression = '';

window.makeElementDraggable = function(selector) {
  setTimeout(() => {
    const card = document.querySelector(selector);
    if (!card) return;
    let isDragging = false, offsetX, offsetY;

    function startDrag(clientX, clientY, target) {
      if (target.closest('.calc-buttons') || target.closest('#explanationText') || target.closest('input')) return;
      isDragging = true;
      card.style.cursor = 'grabbing';
      offsetX = clientX - card.offsetLeft;
      offsetY = clientY - card.offsetTop;
    }

    function doDrag(clientX, clientY) {
      if (!isDragging) return;
      card.style.right = 'auto'; 
      card.style.left = `${clientX - offsetX}px`;
      card.style.top = `${clientY - offsetY}px`;
    }

    function stopDrag() {
      isDragging = false;
      card.style.cursor = 'default';
    }

    card.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY, e.target));
    document.addEventListener('mousemove', (e) => doDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', stopDrag);

    card.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY, e.target);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault(); 
      const touch = e.touches[0];
      doDrag(touch.clientX, touch.clientY);
    }, { passive: false });

    document.addEventListener('touchend', stopDrag);
  }, 100);
}


btnNasa.addEventListener('click', () => {
  appElement.classList.toggle('janela-oculta');
  if (!appElement.classList.contains('janela-oculta')) {
    makeElementDraggable('#app');
  }
});

btnCalc.addEventListener('click', () => {
  calcElement.classList.toggle('janela-oculta');
  if (!calcElement.classList.contains('janela-oculta')) {
    calcElement.style.left = '';
    calcElement.style.top = '40px'; 
    makeElementDraggable('#calc-app');
  }
});

function updateScreen(value) {
  calcScreen.value = value || '0';
}

numButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.innerText === 'G') return;
    currentExpression += button.innerText;
    updateScreen(currentExpression);
  });
});

opButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentExpression += button.innerText;
    updateScreen(currentExpression);
  });
});

clearButton.addEventListener('click', () => {
  currentExpression = '';
  updateScreen('0');
});

backButton.addEventListener('click', () => {
  currentExpression = currentExpression.slice(0, -1);
  updateScreen(currentExpression);
});

equalButton.addEventListener('click', () => {
  try {
    let result = eval(currentExpression);
    currentExpression = String(result); 
    updateScreen(currentExpression);
  } catch (error) {
    updateScreen('Error');
    currentExpression = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (calcElement.classList.contains('janela-oculta')) return;

  const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '%', '.'];

  if (validKeys.includes(e.key)) {
    currentExpression += e.key;
    updateScreen(currentExpression);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    equalButton.click();
  } else if (e.key === 'Backspace') {
    backButton.click();
  } else if (e.key === 'Escape') {
    clearButton.click();
  }
});

function fetchNasaData() {
  appElement.innerHTML = '<p style="color:white; padding:20px;">loading...</p>';

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Error in the API data');
      return response.json();
    })
    .then(data => {
      let mediaHtml = '';

      if (data.media_type === 'image') {
        mediaHtml = `<img src="${data.url}" alt="${data.title}" class="nasa-media" />`;
      } else if (data.url.includes('youtube')) {
        mediaHtml = `<iframe src="${data.url}" frameborder="0" allowfullscreen class="nasa-media"></iframe>`;
      } else {
        mediaHtml = `<video src="${data.url}" controls class="nasa-media"></video>`;
      }

      appElement.innerHTML = `
        <div class="nasa-card">
          <h1 class="nasa-title">${data.title}</h1>
          <p class="nasa-date">${data.date || ''}</p>
          <div class="media-container">
            ${mediaHtml}
          </div>
          <button id="explanationText">See More</button>
          <p class="nasa-explanation" style="display: none;">${data.explanation}</p>
        </div>
      `;

      const button = document.querySelector('#explanationText');
      const explanation = document.querySelector('.nasa-explanation');

      button.addEventListener('click', () => {
        if (explanation.style.display === 'none') {
          explanation.style.display = 'block';
          button.innerText = 'Hide';
        } else {
          explanation.style.display = 'none';
          button.innerText = 'See More';
        }
      });
      
      makeElementDraggable('#app');
    })
    .catch(error => {
      console.error(error);
      appElement.innerHTML = `
        <div class="nasa-card">
          <h1 class="nasa-title">Error Loading Data</h1>
          <p style="color: #ff4a4a;">Verify your connection or API Key.</p>
        </div>
      `;
    });
}

fetchNasaData();
