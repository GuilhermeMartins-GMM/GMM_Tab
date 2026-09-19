import './style.css';

const API_KEY = import.meta.env.VITE_NASA_API_KEY;

let spotlight = document.getElementById('spotlight');
        
window.onmousemove = function(e) {
  spotlight.style.left = e.clientX + 'px';
  spotlight.style.top = e.clientY + 'px';
};

const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;

window.pesquisarGoogle = function() {
  let texto = document.getElementById('inputPesquisa').value;
  window.open('https://google.com/search?q=' + texto);
};

window.abrirNasa = function() {
  document.getElementById('app').classList.toggle('janela-oculta');
};

window.abrirCalc = function() {
  let calc = document.getElementById('calc-app');
  calc.classList.toggle('janela-oculta');
  calc.style.top = '40px';
};

function makeDraggable(selector) {
  let card = document.querySelector(selector);
  
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  card.onmousedown = function(e) { start(e) };
  card.ontouchstart = function(e) { start(e) };

  function start(e) {
    if (e.target.closest('.calc-buttons') || e.target.id == 'explanationText') return;
    
    isDragging = true;
    let p = e.touches ? e.touches[0] : e;
    offsetX = p.clientX - card.offsetLeft;
    offsetY = p.clientY - card.offsetTop;
  }

  document.addEventListener('mousemove', function(e) {
    if (isDragging == true) {
      card.style.left = (e.clientX - offsetX) + 'px';
      card.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
  });
}

makeDraggable('#app');
makeDraggable('#calc-app');

let currentExpression = '';
let calcScreen = document.getElementById('calc-screen');

window.addValor = function(valor) {
  currentExpression += valor;
  calcScreen.value = currentExpression;
};

window.limpar = function() {
  currentExpression = '';
  calcScreen.value = '0';
};

window.apagarUltimo = function() {
  currentExpression = currentExpression.slice(0, -1);
  if (currentExpression == '') {
    calcScreen.value = '0';
  } else {
    calcScreen.value = currentExpression;
  }
};

window.calcular = function() {
  try {
    let resultado = eval(currentExpression);
    currentExpression = String(resultado);
    calcScreen.value = currentExpression;
  } catch (error) {
    calcScreen.value = 'Error';
    currentExpression = '';
  }
};

document.addEventListener('keydown', (e) => {
  let calcElement = document.getElementById('calc-app');
  
  if (calcElement.classList.contains('janela-oculta')) return;

  let validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-','x', '*', '/', '%', '.'];

  if (validKeys.includes(e.key)) {
    let multiplication=e.key.replace('x', '*');
    let porcentage=multiplication.replace('%', '/100');
    window.addValor(porcentage);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    window.calcular();
  } else if (e.key === 'Backspace') {
    window.apagarUltimo();
  } 
});

function dadosNasa() {
  let appElement = document.getElementById('app');

  fetch(url)
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      appElement.innerHTML = `
        <div class="nasa-card">
          <h1 class="nasa-title">${data.title}</h1>
          <p class="nasa-date">${data.date}</p>
          <div class="media-container">
            <img src="${data.url}" class="nasa-media" />
          </div>
          <button id="explanationText" onclick="mostrarTextoNasa()">See More</button>
          <p id="textoNasa" class="nasa-explanation" style="display: none;">${data.explanation}</p>
        </div>
      `;
    })
    .catch(function() {
      appElement.innerHTML = '<h1 style="color:red; padding: 20px;">Error Loading Data</h1>';
    });
}

window.mostrarTextoNasa = function() {
  let texto = document.getElementById('textoNasa');
  let botao = document.getElementById('explanationText');
  
  if (texto.style.display == 'none') {
    texto.style.display = 'block';
    botao.innerText = 'Hide';
  } else {
    texto.style.display = 'none';
    botao.innerText = 'See More';
  }
};

dadosNasa();