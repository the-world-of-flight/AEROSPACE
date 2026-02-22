async function avviaScanner() {
    // 1. Controllo Cache: se abbiamo già i dati, non fare NULLA
    const cache = sessionStorage.getItem("indiceRicerca");
    if (cache) {
        indiceAutomatico = JSON.parse(cache);
        return;
    }

    // 2. Lista pagine
    const pagine = ["index.html", "olla.html", "olla2.html", "calo.html", "maffucci.html", "sesta-generazione.html", "chisiamo.html", "login.html"];
    
    // 3. Scansione Sequenziale (una alla volta)
    for (const url of pagine) {
        try {
            // Saltiamo la scansione se siamo già sulla pagina stessa per evitare loop
            if (window.location.pathname.includes(url)) continue;

            const response = await fetch(url);
            if (!response.ok) continue;
            
            const htmlText = await response.text();
            
            // Rimuoviamo il codice di Live Server dal testo scaricato prima di processarlo
            // Questo blocca la creazione di WebSocket fantasma
            const pulito = htmlText.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(pulito, 'text/html');
            const sezioni = doc.querySelectorAll('section[id]');
            
            sezioni.forEach(s => {
                const titolo = s.querySelector('h2, .accordion')?.innerText.trim() || "Argomento";
                const linkCompleto = url + "#" + s.id;
                
                if (!indiceAutomatico.some(item => item.url === linkCompleto)) {
                    indiceAutomatico.push({
                        titolo: titolo,
                        testo: s.innerText.toLowerCase(),
                        url: linkCompleto
                    });
                }
            });
        } catch (e) {
            console.warn("Errore silenzioso su " + url);
        }
    }
    sessionStorage.setItem("indiceRicerca", JSON.stringify(indiceAutomatico));
}

// --- 1. PROTEZIONE E LOGOUT ---
(function() {
    const oraCorrente = new Date().getTime();
    const urlParams = new URLSearchParams(window.location.search);
    
    // Reset ban tramite URL
    if (urlParams.has('reset')) {
        localStorage.removeItem("banUntil");
        localStorage.removeItem("visitePaginaNovecento");
        alert("Chiave accettata. Accesso ripristinato!");
        window.location.href = window.location.pathname; 
        return;
    }

    // Controllo Ban
    const tempoBlocco = localStorage.getItem("banUntil");
    if (tempoBlocco && oraCorrente < tempoBlocco) {
        document.documentElement.innerHTML = `
            <body style="background:#000; color:#ff0000; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; font-family:sans-serif; margin:0;">
                <h1 style="font-size:3em; border-bottom: 2px solid red;">ACCESSO NEGATO</h1>
                <p style="font-size:1.5em; color:white;">Sei stato bannato per aver abusato del sito.</p>
                <p style="margin-top:30px; color:#444;">ID Blocco: AEROSPACE-SECURITY-900</p>
            </body>`;
        window.stop();
        throw new Error("Utente bannato.");
    }

    // Controllo Login
    if (localStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
    }
})();

function logout() {
    localStorage.removeItem("loggedIn");
    sessionStorage.removeItem("indiceRicerca"); 
    window.location.href = "login.html";
}

// --- 2. LOGICA RICERCA (OTTIMIZZATA) ---
let indiceAutomatico = [];

async function avviaScanner() {
    // FIX: Se abbiamo già i dati, NON procedere oltre.
    const cache = sessionStorage.getItem("indiceRicerca");
    if (cache) {
        indiceAutomatico = JSON.parse(cache);
        console.log("Ricerca caricata dalla cache locale.");
        return;
    }

    const pagine = ["index.html", "olla.html", "olla2.html", "calo.html", "maffucci.html", "sesta-generazione.html", "chisiamo.html", "login.html"];
    console.log("Inizio scansione sequenziale per risparmiare risorse...");
    
    indiceAutomatico = []; 

    // FIX: Usiamo un ciclo for...of per fare una fetch alla volta (sequenziale)
    // Questo evita l'errore ERR_INSUFFICIENT_RESOURCES
    for (const url of pagine) {
        try {
            const response = await fetch(url, { cache: "force-cache" }); // Usa la cache del browser se possibile
            if (!response.ok) continue;
            const htmlText = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const sezioni = doc.querySelectorAll('section[id]');
            
            sezioni.forEach(s => {
                const titolo = s.querySelector('h2, .accordion')?.innerText.trim() || "Argomento";
                const linkCompleto = url + "#" + s.id;
                
                if (!indiceAutomatico.some(item => item.url === linkCompleto)) {
                    indiceAutomatico.push({
                        titolo: titolo,
                        testo: s.innerText.toLowerCase(),
                        url: linkCompleto
                    });
                }
            });
        } catch (e) {
            console.error("Errore durante la scansione di " + url, e);
        }
    }
    
    sessionStorage.setItem("indiceRicerca", JSON.stringify(indiceAutomatico));
    console.log("Scansione completata. Elementi indicizzati:", indiceAutomatico.length);
}

// --- 3. FUNZIONI INTERFACCIA ---
function eseguiRicerca() {
    const input = document.getElementById('searchInput');
    const list = document.getElementById('resultsList');
    if (!input || !list) return;

    const query = input.value.toLowerCase().trim();
    list.innerHTML = '';

    if (query.length < 2) {
        list.style.display = 'none';
        return;
    }

    const filtrati = indiceAutomatico.filter(item => 
        item.testo.includes(query) || item.titolo.toLowerCase().includes(query)
    );

    if (filtrati.length > 0) {
        list.style.display = 'block';
        filtrati.slice(0, 10).forEach(item => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `<strong>${item.titolo}</strong>`;
            div.onclick = () => { window.location.href = item.url; };
            list.appendChild(div);
        });
    } else {
        list.style.display = 'none';
    }
}

// --- 4. INIZIALIZZAZIONE ---
document.addEventListener('DOMContentLoaded', () => {
    // Avvia scanner una sola volta
    avviaScanner(); 
    installaBottoneTornaSu();
    installaCavoTraino();
    inizializzaFlybyMobile();
    inizializzaHomeFlyButton();

    // Gestione Accordion (con chiusura automatica se ne apri un altro)
    const acc = document.querySelectorAll(".accordion");
    acc.forEach(btn => {
        btn.addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel) {
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.display = "block";
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            }
        });
    });

    // Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const menuScreen = document.getElementById('menuScreen');
    if (hamburger && menuScreen) {
        hamburger.onclick = () => {
            hamburger.classList.toggle('open');
            menuScreen.classList.toggle('open');
        };
    }

    // Input Ricerca
    const inputBar = document.getElementById('searchInput');
    if (inputBar) {
        inputBar.addEventListener('input', eseguiRicerca);
    }

    // Auto-apertura tramite Hash (Link diretti)
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const accBtn = target.querySelector('.accordion');
                if (accBtn) accBtn.click();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }, 800);
    }
});

function installaBottoneTornaSu() {
    if (document.getElementById('scroll-to-top-btn')) return;
    const btn = document.createElement("button");
    btn.id = 'scroll-to-top-btn';
    btn.innerHTML = "↑";
    Object.assign(btn.style, {
        position: "fixed", bottom: "20px", right: "20px", padding: "10px 15px",
        display: "none", cursor: "pointer", zIndex: "1000", borderRadius: "5px",
        backgroundColor: "#003366", color: "white", border: "none", fontSize: "20px"
    });
    document.body.appendChild(btn);
    window.addEventListener("scroll", () => {
        btn.style.display = window.scrollY > 300 ? "block" : "none";
    });
    btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

function installaCavoTraino() {
    const plane = document.querySelector('.flyby-plane');
    const cargoMain = document.querySelector('.tow-cargo main');
    if (!plane || !cargoMain) return;

    let cable = document.querySelector('.tow-cable');
    if (!cable) {
        cable = document.createElement('div');
        cable.className = 'tow-cable';
        document.body.appendChild(cable);
    }

    const updateCable = () => {
        const p = plane.getBoundingClientRect();
        const c = cargoMain.getBoundingClientRect();

        // Punto di attacco in zona coda dell'aereo.
        const endX = p.left + p.width * 0.2;
        const endY = p.top + p.height * 0.53;

        // Cavo orizzontale: stessa quota della coda dell'aereo.
        const startX = c.right;
        const startY = endY;
        const length = Math.max(0, endX - startX);

        const visible = length > 8 && p.bottom > 0 && p.top < window.innerHeight + 40;
        cable.style.opacity = visible ? '0.9' : '0';

        if (visible) {
            cable.style.width = `${length}px`;
            cable.style.transform = `translate(${startX}px, ${startY}px)`;
        }

        window.requestAnimationFrame(updateCable);
    };

    window.requestAnimationFrame(updateCable);
}

function inizializzaHomeFlyButton() {
    const homeBtn = document.querySelector('.home-fly-btn');
    const plane = document.querySelector('.flyby-plane');
    const cargo = document.querySelector('.tow-cargo');
    if (!homeBtn || !plane || !cargo) return;

    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (document.body.classList.contains('flyby-exit')) return;

        document.body.classList.add('flyby-exit');
        const isMobile = window.matchMedia('(max-width: 699px)').matches;
        if (isMobile && plane.classList.contains('mobile-hidden')) {
            plane.classList.remove('mobile-hidden');
            plane.style.opacity = '1';
        }
        const planeComputed = window.getComputedStyle(plane);
        const cargoComputed = window.getComputedStyle(cargo);
        const cargoRect = cargo.getBoundingClientRect();
        const planeRect = plane.getBoundingClientRect();

        const currentCargoX = cargoComputed.transform === 'none'
            ? 0
            : new DOMMatrixReadOnly(cargoComputed.transform).m41;
        const cargoDeltaToRight = (window.innerWidth - cargoRect.left) + 120;
        const targetCargoX = currentCargoX + cargoDeltaToRight;

        const currentPlaneLeft = parseFloat(planeComputed.left) || planeRect.left;
        const targetPlaneLeft = window.innerWidth + planeRect.width + 40;

        // Blocca nello stato corrente per evitare scatti tra animazione in corso e uscita.
        plane.style.animation = 'none';
        cargo.style.animation = 'none';
        plane.style.left = `${currentPlaneLeft}px`;
        plane.style.opacity = isMobile ? '1' : planeComputed.opacity;
        cargo.style.transform = `translateX(${currentCargoX}px)`;

        void plane.offsetWidth;

        plane.style.transition = 'left 2.2s ease-in-out, opacity 2.2s ease-in-out';
        cargo.style.transition = 'transform 2.2s ease-in-out 0.8s';

        window.requestAnimationFrame(() => {
            plane.style.left = `${targetPlaneLeft}px`;
            cargo.style.transform = `translateX(${targetCargoX}px)`;
        });

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3200);
    });
}

function inizializzaFlybyMobile() {
    if (!window.matchMedia('(max-width: 699px)').matches) return;

    const plane = document.querySelector('.flyby-plane');
    if (!plane) return;

    // Dopo l'arrivo iniziale su mobile nasconde l'aereo;
    // ricomparirà quando l'utente preme Home per il traino in uscita.
    plane.addEventListener('animationend', () => {
        if (document.body.classList.contains('flyby-exit')) return;
        plane.classList.add('mobile-hidden');
    }, { once: true });
}


