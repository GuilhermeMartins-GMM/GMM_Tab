import './style.css';

const API_KEY = import.meta.env.VITE_NASA_API_KEY;
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

btnNasa.addEventListener('click', () => {
  if (appElement.style.display === 'none') {
    appElement.style.display = 'block';
    makeElementDraggable('.nasa-card'); 
  } else {
    appElement.style.display = 'none';
  }
});

btnCalc.addEventListener('click', () => {
  if (calcElement.style.display === 'none') {
    calcElement.style.display = 'block';
    makeElementDraggable('#calc-app');
  } else {
    calcElement.style.display = 'none';
  }
});

function updateScreen(value) {
  calcScreen.value = value || '0';
}

numButtons.forEach(button => {
  button.addEventListener('click', () => {
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
  if (calcElement.style.display === 'none') return;

  const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '%', '(', ')', '.'];

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

async function fetchNasaData() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error in the API data');
    const data = await response.json();

    appElement.innerHTML = `
      <div class="nasa-card">
        <h1 class="nasa-title">${data.title}</h1>
        <p class="nasa-date">${data.date}</p>
        <div class="media-container">
          ${data.media_type === 'image' 
            ? `<img src="${data.url}" alt="${data.title}" class="nasa-media" />`
            : `<iframe src="${data.url}" frameborder="0" allowfullscreen class="nasa-media"></iframe>`
          }
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

  } catch (error) {
    console.error(error);
    appElement.innerHTML = `
      <div class="nasa-card">
        <h1 class="nasa-title">Error Loading Data</h1>
        <p class="nasa-date">Please check connection</p>
        <div class="media-container" style="background: rgba(255, 255, 255, 0.05); border: 2px dashed rgba(255, 255, 255, 0.2); border-radius: 10px; height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 10px; box-sizing: border-box;">
          <p style="color: #ff4a4a; font-weight: bold; margin: 0 0 5px 0;">NASA data failed.</p>
          <small style="color: #cbd5e1;">Verify your API Key.</small>
        </div>
        <button id="explanationText" style="opacity: 0.5; cursor: not-allowed;" disabled>See More</button>
      </div>
    `;
  }
}

fetchNasaData();

function makeElementDraggable(selector) {
  setTimeout(() => {
    const card = document.querySelector(selector);
    if (!card) return;
    let isDragging = false, offsetX, offsetY;

    card.addEventListener('mousedown', (e) => {
      if (e.target.closest('.calc-buttons') || e.target.closest('#explanationText')) return;

      isDragging = true;
      card.style.cursor = 'grabbing';
      offsetX = e.clientX - card.getBoundingClientRect().left;
      offsetY = e.clientY - card.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      card.style.left = `${e.clientX - offsetX}px`;
      card.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      card.style.cursor = 'default';
    });
  }, 100);
}
