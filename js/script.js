// ==========================================
// 1. OBSŁUGA HOVERA NA OSI CZASU (STARY KOD)
// ==========================================
const activeEpochs = document.querySelectorAll('.epoch:not(.spacer-only)');

activeEpochs.forEach(epoch => {
    let timeoutId = null;

    epoch.addEventListener('mouseenter', () => {
        if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
        epoch.classList.add('active-hover');
    });

    epoch.addEventListener('mouseleave', () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            epoch.classList.remove('active-hover');
        }, 1000); 
    });
});

// ==========================================
// 2. DYNAMICZNA BAZA SAMOLOTÓW I ROTACJA
// ==========================================

// Nasza ukryta baza danych – możesz tu dopisać ile chcesz maszyn!
const planeDatabase = [
    { 
        name: "Spitfire Mk V", 
        desc: "Ikona Bitwy o Anglię i Dywizjonu 303.", 
        img: "assets/spitfire.png",
        specs: { era: "II Wojna Światowa", speed: "605 km/h", engine: "Rolls-Royce Merlin", weapons: "2x działko 20mm, 4x KM" },
        sound: "assets/sounds/merlin_engine.mp3",
    },
    { 
        name: "Bell X-1", 
        desc: "Pierwsze przełamanie bariery dźwięku (1947).", 
        img: "assets/bell_x1.png",
        specs: { era: "Złota Era Odwagi", speed: "1510 km/h (Mach 1.4)", engine: "Rakietowy XLR11", weapons: "Brak (Badań naukowych)" },
        sound: "assets/sounds/bell.mp3",
    },
    { 
        name: "SR-71 Blackbird", 
        desc: "Legendarny król prędkości – Mach 3.3.", 
        img: "assets/sr71.png",
        specs: { era: "Zimna Wojna", speed: "3540 km/h (Mach 3.3)", engine: "2x Pratt & Whitney J58", weapons: "Brak (Zwiad strategiczny)" },
        sound: "assets/sounds/sr71.mp3",
    },
    { 
        name: "F-22 Raptor", 
        desc: "Dominator niebios i technologia Stealth.", 
        img: "assets/f22.png",
        specs: { era: "Współczesność (V gen.)", speed: "2410 km/h (Mach 2.25)", engine: "2x Pratt & Whitney F119", weapons: "Działko 20mm, rakiety AIM-120" },
        sound: "assets/sounds/f22.mp3",
    },
    { 
        name: "Messerschmitt Me 262", 
        desc: "Pierwszy seryjny myśliwiec odrzutowy w historii.", 
        img: "assets/262-UK.png",
        specs: { era: "Koniec II WŚ", speed: "870 km/h", engine: "2x Junkers Jumo 004", weapons: "4x działko MK 108 30mm" },
        sound: "assets/sounds/me262.mp3",
    },
    { 
        name: "Sopwith Camel", 
        desc: "Najgroźniejszy brytyjski myśliwiec I Wojna Światowej.", 
        img: "assets/camel.png",
        specs: { era: "I Wojna Światowa", speed: "185 km/h", engine: "Rotacyjny Clerget", weapons: "2x KM Vickers 7,7mm" },
        sound: "assets/sounds/camel.mp3",
    },
    { 
        name: "F-35 Lightning II", 
        desc: "Współczesny wielozadaniowy myśliwiec V generacji.", 
        img: "assets/f35.png",
        specs: { era: "Nowoczesność", speed: "1930 km/h (Mach 1.6)", engine: "Pratt & Whitney F135", weapons: "Działko 25mm, bomby kierowane" },
        sound: "assets/sounds/f35.mp3",
    },
    { 
        name: "Wright Flyer I", 
        desc: "Maszyna, od której wszystko się zaczęło w 1903 roku.", 
        img: "assets/FlyerI.png",
        specs: { era: "Pionier Lotnictwa", speed: "48 km/h", engine: "Własny Wrightów (12 KM)", weapons: "Brak (Aparaty fotograficzne)" },
        sound: "assets/sounds/FlyerI.mp3",
    }
];

// Indeksy samolotów, które aktualnie wyświetlamy w 4 slotach na stronie
let currentDisplayedIndices = [0, 1, 2,];

// Funkcja generująca kod HTML wewnątrz kafelka
function renderCardContent(cardElement, planeData) {
    // 1. SPRZĄTANIE: Zatrzymujemy stary dźwięk i czyścimy eventy, jeśli istnieją
    if (cardElement.engineSound) {
        cardElement.engineSound.pause();
        cardElement.engineSound.currentTime = 0;
        // Usuwamy stare listenery, żeby nie było "duchów" w pamięci
        cardElement.removeEventListener('mouseenter', cardElement.playHandler);
        cardElement.removeEventListener('mouseleave', cardElement.stopHandler);
    }

    // 2. WSTRZYKIWANIE HTML
    cardElement.innerHTML = `
        <img class="aircraft-card-img" src="${planeData.img}" alt="${planeData.name}">
        <div class="aircraft-card-badge"><h3>${planeData.name}</h3></div>
        <div class="aircraft-info-overlay">
            <div class="overlay-header">
                <h3>${planeData.name}</h3>
                <span class="aircraft-era">${planeData.specs.era}</span>
            </div>
            <ul class="aircraft-specs-list">
                <li><span>Prędkość:</span> ${planeData.specs.speed}</li>
                <li><span>Napęd:</span> ${planeData.specs.engine}</li>
                <li><span>Uzbrojenie:</span> ${planeData.specs.weapons}</li>
            </ul>
            <p class="overlay-description">${planeData.desc}</p>
        </div>
    `;

    // 3. NOWY DŹWIĘK
    if (planeData.sound) {
        cardElement.engineSound = new Audio(planeData.sound);
        cardElement.engineSound.volume = 0.4;
        cardElement.engineSound.loop = true;

        // Tworzymy funkcje handlerów, żeby móc je później usunąć
        cardElement.playHandler = () => cardElement.engineSound.play().catch(() => {});
        cardElement.stopHandler = () => {
            cardElement.engineSound.pause();
            cardElement.engineSound.currentTime = 0;
        };

        cardElement.addEventListener('mouseenter', cardElement.playHandler);
        cardElement.addEventListener('mouseleave', cardElement.stopHandler);
    }
}

// Pierwsze, startowe załadowanie maszyn po włączeniu strony
function initLegends() {
    for (let i = 0; i < 3; i++) {
        const card = document.getElementById(`slot-${i}`);
        if (card) {
            card.classList.add('aircraft-card'); // Doda klasę, jeśli jej nie ma
            renderCardContent(card, planeDatabase[currentDisplayedIndices[i]]);
        }
    }
}

// Funkcja odpowiedzialna za losową rotację jednego z kafelków
function rotateDatabase() {
    // Losujemy, który slot na stronie (0, 1, 2 lub 3) zmieni maszynę
    const slotToChange = Math.floor(Math.random() * 3);
    const cardElement = document.getElementById(`slot-${slotToChange}`);
    
    if (!cardElement) return;

    // Szukamy samolotu z bazy, który NIE JEST aktualnie wyświetlany na ekranie
    let newPlaneIndex;
    do {
        newPlaneIndex = Math.floor(Math.random() * planeDatabase.length);
    } while (currentDisplayedIndices.includes(newPlaneIndex));

    // KROK A: Płynne ściemnianie karty (fade-out)
    cardElement.classList.add('fade-out');

    // KROK B: Czekamy 600ms aż karta zgaśnie, podmieniamy dane i ją rozjaśniamy (fade-in)
    setTimeout(() => {
        currentDisplayedIndices[slotToChange] = newPlaneIndex; // zapisujemy, że ten samolot już zajmuje slot
        renderCardContent(cardElement, planeDatabase[newPlaneIndex]);
        cardElement.classList.remove('fade-out'); // rozjaśniamy kartę z nową treścią
    }, 600);
}

// Odpalamy start bazy danych
initLegends();

// Uruchamiamy automatyczną rotację: co 8 sekundy (8000 ms) jeden losowy kafelek się podmieni!
setInterval(rotateDatabase, 8000);
