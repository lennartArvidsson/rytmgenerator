// ============ INSTÄLLNINGAR ============
const config = {
    // Grid
    antalRutor: 16,
    antalRader: 1,  // För framtida multi-track

    // Timing
    tempo: 120,  // BPM
    get intervall() { return 60000 / this.tempo / 4; }, // ms mellan 16-delar

    // Ljud
    frekvens: 800,  // Hz
    volym: 0.3,     // 0-1
    tonLangd: 0.05,  // sekunder

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

// Skapa gridrutorna
const grid = document.getElementById('rytm-grid');
const antalRutor = config.antalRutor;
const rutor = [];
let spelareInterval = null;
let nuvarandeRuta = 0;

// Generera rutor
for (let i = 0; i < antalRutor; i++) {
    const ruta = document.createElement('div');
    ruta.className = 'ruta';
    ruta.dataset.index = i;

    ruta.addEventListener('click', function () {
        this.classList.toggle('aktiv');
    });

    grid.appendChild(ruta);
    rutor.push(ruta);
}

// Enkel Web Audio API för ljud
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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
    // Ta bort "spelar"-markering från alla
    rutor.forEach(r => r.classList.remove('spelar'));

    // Markera nuvarande ruta
    rutor[nuvarandeRuta].classList.add('spelar');

    // Om rutan är aktiv, spela ljud
    if (rutor[nuvarandeRuta].classList.contains('aktiv')) {
        spelaLjud();
    }

    // Gå till nästa ruta (loopa runt)
    nuvarandeRuta = (nuvarandeRuta + 1) % antalRutor;
}

// Knappfunktioner
document.getElementById('spela').addEventListener('click', function () {
    if (spelareInterval === null) {
        spelareInterval = setInterval(spelaSteg, config.intervall);
    }
});

document.getElementById('stopp').addEventListener('click', function () {
    if (spelareInterval !== null) {
        clearInterval(spelareInterval);
        spelareInterval = null;
        rutor.forEach(r => r.classList.remove('spelar'));
        nuvarandeRuta = 0;
    }
});

document.getElementById('rensa').addEventListener('click', function () {
    rutor.forEach(ruta => ruta.classList.remove('aktiv'));
});

// Tempo slider
const tempoSlider = document.getElementById('tempo-slider');
const tempoVärde = document.getElementById('tempo-varde');

tempoSlider.addEventListener('input', function () {
    config.tempo = parseInt(this.value);
    tempoVärde.textContent = config.tempo;

    // Om spelaren är igång, starta om med nytt tempo
    if (spelareInterval !== null) {
        clearInterval(spelareInterval);
        spelareInterval = setInterval(spelaSteg, config.intervall);
    }
});