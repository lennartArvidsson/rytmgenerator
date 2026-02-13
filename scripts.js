// ============ INSTÄLLNINGAR ============
const config = {
    // Grid
    antalRutor: 16,
    antalRader: 1,
    taktart: '4/4',
    minstaEnhet: 16,

    // Timing
    tempo: 120,
    get intervall() { return 60000 / this.tempo / (this.minstaEnhet / 4); },

    // Ljud
    frekvens: 800,
    volym: 0.3,
    volymTrack2: 0.3,
    tonLangd: 0.1,

    // Utseende
    rutStorlek: 40,
    gap: 5,

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

// ============ SPARFUNKTIONER ============

function sparaState() {
    // Spara config
    const sparadConfig = {
        antalRutor: config.antalRutor,
        antalRader: config.antalRader,
        taktart: config.taktart,
        minstaEnhet: config.minstaEnhet,
        tempo: config.tempo,
        volym: config.volym,
        volymTrack2: config.volymTrack2,
        tonLangd: config.tonLangd
    };

    // Spara rytmmönster (vilka rutor som är aktiva)
    const rytmMönster = [];
    for (let rad = 0; rad < rutor.length; rad++) {
        rytmMönster[rad] = [];
        for (let kol = 0; kol < rutor[rad].length; kol++) {
            rytmMönster[rad][kol] = rutor[rad][kol].classList.contains('aktiv');
        }
    }

    localStorage.setItem('rytmConfig', JSON.stringify(sparadConfig));
    localStorage.setItem('rytmMönster', JSON.stringify(rytmMönster));

    console.log('Sparade inställningar och rytm');
}

function laddaState() {
    // Ladda config
    const sparadConfig = localStorage.getItem('rytmConfig');
    if (sparadConfig) {
        const parsed = JSON.parse(sparadConfig);
        Object.assign(config, parsed);

        // Uppdatera UI-element
        document.getElementById('tempo-slider').value = config.tempo;
        document.getElementById('tempo-värde').textContent = config.tempo;

        document.getElementById('volym-slider').value = Math.round(config.volym * 100);
        document.getElementById('volym-värde').textContent = Math.round(config.volym * 100);

        document.getElementById('volym-track2-slider').value = Math.round(config.volymTrack2 * 100);
        document.getElementById('volym-track2-värde').textContent = Math.round(config.volymTrack2 * 100);

        document.getElementById('tonlangd-slider').value = Math.round(config.tonLangd * 1000);
        document.getElementById('tonlangd-värde').textContent = Math.round(config.tonLangd * 1000);

        document.getElementById('taktart').value = config.taktart;
        document.getElementById('antal-tracks').value = config.antalRader;
        document.getElementById('minsta-enhet').value = config.minstaEnhet;

        console.log('Laddade sparade inställningar');
    }
}

function laddaRytmMönster() {
    const sparatMönster = localStorage.getItem('rytmMönster');
    if (sparatMönster) {
        const mönster = JSON.parse(sparatMönster);

        // Applicera mönstret på rutorna
        for (let rad = 0; rad < mönster.length && rad < rutor.length; rad++) {
            for (let kol = 0; kol < mönster[rad].length && kol < rutor[rad].length; kol++) {
                if (mönster[rad][kol]) {
                    rutor[rad][kol].classList.add('aktiv');
                }
            }
        }

        console.log('Laddade sparat rytmmönster');
    }
}

// Spara automatiskt vid sidstängning
window.addEventListener('beforeunload', function () {
    sparaState();
});

// Spara också med jämna mellanrum (var 5:e sekund)
setInterval(sparaState, 5000);

// ========================================

// Beräkna antal rutor baserat på taktart och minsta enhet
function beräknaAntalRutor(taktart, minstaEnhet) {
    const [täljare, nämnare] = taktart.split('/').map(Number);
    return täljare * (minstaEnhet / nämnare);
}

// Funktion för att skapa/återskapa gridet
function skapaGrid() {
    grid.innerHTML = '';
    rutor = [];

    // Uppdatera grid-layout
    grid.style.gridTemplateColumns = `repeat(${config.antalRutor}, ${config.rutStorlek}px)`;
    grid.style.gridTemplateRows = `repeat(${config.antalRader}, ${config.rutStorlek}px)`;

    // Skapa rutor för varje rad
    for (let rad = 0; rad < config.antalRader; rad++) {
        rutor[rad] = [];

        for (let kol = 0; kol < config.antalRutor; kol++) {
            const ruta = document.createElement('div');
            ruta.className = 'ruta';
            ruta.dataset.rad = rad;
            ruta.dataset.kol = kol;

            ruta.addEventListener('click', function () {
                this.classList.toggle('aktiv');
            });

            grid.appendChild(ruta);
            rutor[rad].push(ruta);
        }
    }

    // Visa/dölj track 2-volym
    const volymTrack2Grupp = document.getElementById('volym-track2-grupp');
    if (config.antalRader === 2) {
        volymTrack2Grupp.style.display = 'block';
    } else {
        volymTrack2Grupp.style.display = 'none';
    }

    // Ladda sparat mönster efter att gridet skapats
    laddaRytmMönster();
}

// Ljud-funktion med diskant/bas
function spelaLjud(radIndex) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (radIndex === 0) {
        // Track 1 - Diskant/Höger hand
        oscillator.frequency.value = 1200;
        gainNode.gain.value = config.volym * 0.8;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + config.tonLangd * 0.7);
    } else {
        // Track 2 - Bas/Vänster hand
        oscillator.frequency.value = 400;
        gainNode.gain.value = config.volymTrack2 * 1.2;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + config.tonLangd * 1.3);
    }
}

// Uppspelningsloop
function spelaSteg() {
    rutor.forEach(rad => rad.forEach(r => r.classList.remove('spelar')));

    for (let rad = 0; rad < config.antalRader; rad++) {
        rutor[rad][nuvarandeRuta].classList.add('spelar');

        if (rutor[rad][nuvarandeRuta].classList.contains('aktiv')) {
            spelaLjud(rad);
        }
    }

    nuvarandeRuta = (nuvarandeRuta + 1) % config.antalRutor;
}

// Stoppa uppspelning
function stoppaSpelaer() {
    if (spelareInterval !== null) {
        clearInterval(spelareInterval);
        spelareInterval = null;
        rutor.forEach(rad => rad.forEach(r => r.classList.remove('spelar')));
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
    rutor.forEach(rad => rad.forEach(ruta => ruta.classList.remove('aktiv')));
});

// Tempo slider
const tempoSlider = document.getElementById('tempo-slider');
const tempoVärde = document.getElementById('tempo-värde');

tempoSlider.addEventListener('input', function () {
    config.tempo = parseInt(this.value);
    tempoVärde.textContent = config.tempo;

    if (spelareInterval !== null) {
        clearInterval(spelareInterval);
        spelareInterval = setInterval(spelaSteg, config.intervall);
    }
});

// Volym slider (diskant/track 1)
const volymSlider = document.getElementById('volym-slider');
const volymVärde = document.getElementById('volym-värde');

volymSlider.addEventListener('input', function () {
    const procent = parseInt(this.value);
    config.volym = procent / 100;
    volymVärde.textContent = procent;
});

// Volym slider track 2 (bas)
const volymTrack2Slider = document.getElementById('volym-track2-slider');
const volymTrack2Värde = document.getElementById('volym-track2-värde');

volymTrack2Slider.addEventListener('input', function () {
    const procent = parseInt(this.value);
    config.volymTrack2 = procent / 100;
    volymTrack2Värde.textContent = procent;
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
    stoppaSpelaer();

    config.taktart = document.getElementById('taktart').value;
    config.antalRader = parseInt(document.getElementById('antal-tracks').value);
    config.minstaEnhet = parseInt(document.getElementById('minsta-enhet').value);

    config.antalRutor = beräknaAntalRutor(config.taktart, config.minstaEnhet);

    skapaGrid();
});

// ============ INITIALISERING ============
laddaState();  // Ladda sparade inställningar först
skapaGrid();   // Sedan skapa gridet (som även laddar rytmmönstret)