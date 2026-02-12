// Skapa gridrutorna
const grid = document.getElementById('rytm-grid');
const antalRutor = 16;
const rutor = [];
let spelareInterval = null;
let nuvarandeRuta = 0;

// Generera 16 rutor
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

    oscillator.frequency.value = 800; // Hz
    gainNode.gain.value = 0.3;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
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
        spelareInterval = setInterval(spelaSteg, 300); // 300ms mellan slag
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