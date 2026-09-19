import './style.css';

const API_KEY = import.meta.env?.VITE_NASA_API_KEY || 'DEMO_KEY';


const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;

const appElement = document.querySelector('#app');
const nasa = document.querySelector('#nasa');
const calcElement = document.querySelector('#calc-app');
const calc = document.querySelector('#calc');

const calcScreen = document.querySelector('#calc-screen');
const numButtons = document.querySelectorAll('.btn-num');
const opButtons = document.querySelectorAll('.btn-op');
const clearButton = document.querySelector('.btn-clear');
const backButton = document.querySelector('.btn-back');
const equalButton = document.querySelector('#btn-equal');

const snakeElement = document.querySelector('#snake-app');
const Snake = document.querySelector('#Snake');
const canvas = document.querySelector('#snake-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.querySelector('#snake-score');

const gridSize = 14;
let tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let velocity = { x: 1, y: 0 };
let food = { x: 5, y: 5 };
let score = 0;
let gameInterval = null;

let currentExpression = '' ;

window.makeElementDraggable = function(selector) {

  const card = document.querySelector(selector);
  if (!card) return;
    let isDragging = false, offsetX, offsetY;

  function startDrag(clientX, clientY, target) {
    if (target.closest('.calc-buttons') || target.closest('#explanationText') || target.closest('input') || target.tagName.toLowerCase() === 'canvas') return;
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
}


nasa.addEventListener('click', () => {
  appElement.classList.toggle('janela-oculta');
  if (!appElement.classList.contains('janela-oculta')) {
    makeElementDraggable('#app');
  }
});

calc.addEventListener('click', () => {
  calcElement.classList.toggle('janela-oculta');
  if (!calcElement.classList.contains('janela-oculta')) {
    calcElement.style.left = '';
    calcElement.style.top = '40px'; 
    makeElementDraggable('#calc-app');
  }
});

Snake.addEventListener('click', () => {
  snakeElement.classList.toggle('janela-oculta');
  if (!snakeElement.classList.contains('janela-oculta')) {
    resetGame();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 200);
    makeElementDraggable('#snake-app');
  } else {
    clearInterval(gameInterval);
  }
});

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 1, y: 0 };
  score = 0;
  scoreElement.innerText = score;
  spawnFood();
}

function spawnFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
}

function gameLoop() {

  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    alert(`Game Over! Pontuação: ${score}`);
    resetGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.innerText = score;
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = 'rgb(18, 7, 35)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgb(55, 191, 83)';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);

  snake.forEach((segment, index) => {
    ctx.fillStyle = 'rgb(95, 48, 205)';
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
  });
}

document.addEventListener('keydown', (e) => {
  if (snakeElement.classList.contains('janela-oculta')) return;

  switch (e.key) {
    case 'ArrowUp':
      if (velocity.y !== 1) velocity = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (velocity.y !== -1) velocity = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (velocity.x !== 1) velocity = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (velocity.x !== -1) velocity = { x: 1, y: 0 };
      break;
  }
});

function updateScreen(value) {
  calcScreen.value = value || '0';
}

numButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.innerText === 'GMM') return;
    currentExpression += button.innerText;
    updateScreen(currentExpression);
  });
});

opButtons.forEach(button => {
  button.addEventListener('click', () => {
    let realExpression=button.innerText.replaceAll('x', '*');
    currentExpression += realExpression;
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
    let realExpression=currentExpression.replaceAll('%', '/100');
    let result = eval(realExpression);
    currentExpression = String(result); 
    updateScreen(currentExpression);
  } catch (error) {
    updateScreen('Error');
    currentExpression = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (calcElement.classList.contains('janela-oculta')) return;

  const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', 'x', '/', '%', '.'];

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
