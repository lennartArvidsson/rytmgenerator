// ============ INSTÄLLNINGAR ============
const config = {
    // Grid
    antalRutor: 16,
    antalRader: 1,
    taktart: '4/4',
    minstaEnhet: 16,  // 16-delar per takt

    // Timing
    tempo: 120,  // BPM
    get intervall() { return 60000 / this.tempo / (this.minstaEnhet / 4); }, // ms mellan slag

    // Ljud
    frekvens: 800,  // Hz
    volym: 0.3,     // 0-1
    tonLangd: 0.1,  // sekunder

    // Utseende
    rutStorlek: 40,  // pixels
    gap: 5,         // pixels mellan rutor

    // Färger
    farger: {
        inaktiv: '#bbb',
        inaktivSpelar: '#e0e0e0',
        aktiv: '#4CAF50',
        aktivSpelar: '#8FD694'
    }
};
// =======================================

// Globala variabler
const grid = document.getElementById('rytm-grid');
let rutor = [];
let spelareInterval = null;
let nuvarandeRuta = 0;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Funktion för att skapa/återskapa gridet
function skapaGrid() {
    // Rensa befintligt grid
    grid.innerHTML = '';
    rutor = [];

    // Uppdatera grid-kolumner i CSS
    grid.style.gridTemplateColumns = `repeat(${config.antalRutor}, ${config.rutStorlek}px)`;

    // Generera rutor
    for (let i = 0; i < config.antalRutor; i++) {
        const ruta = document.createElement('div');
        ruta.className = 'ruta';
        ruta.dataset.index = i;

        ruta.addEventListener('click', function () {
            this.classList.toggle('aktiv');
        });

        grid.appendChild(ruta);
        rutor.push(ruta);
    }
}

// Ljud-funktion
function spelaLjud() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = config.frekvens;
    gainNode.gain.value = config.volym;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + config.tonLangd);
}

// Uppspelningsloop
function spelaSteg() {
    rutor.forEach(r => r.classList.remove('spelar'));
    rutor[nuvarandeRuta].classList.add('spelar');

    if (rutor[nuvarandeRuta].classList.contains('aktiv')) {
        spelaLjud();
    }

    nuvarandeRuta = (nuvarandeRuta + 1) % config.antalRutor;
}

// Stoppa uppspelning
function stoppaSpelaer() {
    if (spelareInterval !== null) {
        clearInterval(spelareInterval);
        spelareInterval = null;
        rutor.forEach(r => r.classList.remove('spelar'));
        nuvarandeRuta = 0;
    }
}

// ============ EVENT LISTENERS ============

// Spelknappar
document.getElementById('spela').addEventListener('click', function () {
    if (spelareInterval === null) {
        spelareInterval = setInterval(spelaSteg, config.intervall);
    }
});

document.getElementById('stopp').addEventListener('click', stoppaSpelaer);

document.getElementById('rensa').addEventListener('click', function () {
    rutor.forEach(ruta => ruta.classList.remove('aktiv'));
});

// Tempo slider
const tempoSlider = document.getElementById('tempo-slider');
const tempoVärde = document.getElementById('tempo-värde');

tempoSlider.addEventListener('input', function () {
    config.tempo = parseInt(this.value);
    tempoVärde.textContent = config.tempo;

    // Om spelaren är igång, starta om med nytt tempo
    if (spelareInterval !== null) {
        clearInterval(spelareInterval);
        spelareInterval = setInterval(spelaSteg, config.intervall);
    }
});

// Volym slider
const volymSlider = document.getElementById('volym-slider');
const volymVärde = document.getElementById('volym-värde');

volymSlider.addEventListener('input', function () {
    const procent = parseInt(this.value);
    config.volym = procent / 100;
    volymVärde.textContent = procent;
});

// Tonlängd slider
const tonlangdSlider = document.getElementById('tonlangd-slider');
const tonlangdVärde = document.getElementById('tonlangd-värde');

tonlangdSlider.addEventListener('input', function () {
    const ms = parseInt(this.value);
    config.tonLangd = ms / 1000;
    tonlangdVärde.textContent = ms;
});

// Aside-inställningar - Tillämpa-knappen
document.getElementById('tillämpa').addEventListener('click', function () {
    // Stoppa uppspelning om igång
    stoppaSpelaer();

    // Läs nya värden från aside
    config.taktart = document.getElementById('taktart').value;
    config.antalRader = parseInt(document.getElementById('antal-tracks').value);
    config.minstaEnhet = parseInt(document.getElementById('minsta-enhet').value);

    // Beräkna nytt antal rutor baserat på minsta enhet
    config.antalRutor = config.minstaEnhet;

    // Återskapa gridet
    skapaGrid();
});

// ============ INITIALISERING ============
skapaGrid();