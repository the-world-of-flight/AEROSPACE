async function avviaScanner() {
    // 1. Controllo Cache: se abbiamo già i dati, non fare NULLA
    const cache = sessionStorage.getItem("indiceRicerca");
    if (cache) {
        indiceAutomatico = JSON.parse(cache);
        return;
    }

    // 2. Lista pagine
    const pagine = ["olla.html", "index.html", "maffucci.html", "olla2.html", "calo.html"];
    
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
    if (localStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
    }
})();

function logout() {
    localStorage.removeItem("loggedIn");
    sessionStorage.removeItem("indiceRicerca");
    window.location.href = "login.html";
}

// --- 2. LOGICA SCANNER (Ottimizzata per evitare ERR_INSUFFICIENT_RESOURCES) ---
let indiceAutomatico = [];

async function avviaScanner() {
    const cache = sessionStorage.getItem("indiceRicerca");
    if (cache) {
        indiceAutomatico = JSON.parse(cache);
        console.log("Ricerca caricata dalla cache di sessione.");
        return;
    }

    const pagine = ["olla.html", "index.html", "maffucci.html", "olla2.html", "calo.html"];
    console.log("Avvio scansione intelligente delle pagine...");

    // Eseguiamo le richieste una alla volta (sequenziali) per non bloccare il browser
    for (const url of pagine) {
        try {
            const response = await fetch(url, { priority: 'low' });
            if (!response.ok) continue;
            
            const htmlText = await response.text();
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');
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
            console.warn(`Impossibile indicizzare ${url}:`, e);
        }
    }
    sessionStorage.setItem("indiceRicerca", JSON.stringify(indiceAutomatico));
}

// --- 3. FUNZIONE RICERCA ---
function eseguiRicerca() {
    const input = document.getElementById('searchInput');
    const list = document.getElementById('resultsList');
    if (!input || !list) return;

    const query = input.value.toLowerCase().trim();
    if (query.length < 2) {
        list.style.display = 'none';
        return;
    }

    const filtrati = indiceAutomatico.filter(item => 
        item.testo.includes(query) || item.titolo.toLowerCase().includes(query)
    );

    list.innerHTML = '';
    if (filtrati.length > 0) {
        list.style.display = 'block';
        filtrati.slice(0, 10).forEach(item => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `<strong>${item.titolo}</strong>`;
            div.onclick = () => window.location.href = item.url;
            list.appendChild(div);
        });
    } else {
        list.style.display = 'none';
    }
}

// --- 4. INIZIALIZZAZIONE DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Avvia scanner e componenti
    avviaScanner();

    // Menu Hamburger
    const hamburger = document.getElementById('hamburger');
    const menuScreen = document.getElementById('menuScreen');
    if (hamburger && menuScreen) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            menuScreen.classList.toggle('open');
        });
    }

    // Input Ricerca
    const inputBar = document.getElementById('searchInput');
    if (inputBar) {
        inputBar.addEventListener('input', eseguiRicerca);
    }
    
    // Gestione automatica Hash (per aprire accordion da link esterni)
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const btn = target.querySelector('.accordion');
                if (btn) {
                    btn.classList.add("active");
                    const panel = btn.nextElementSibling;
                    if (panel) {
                        panel.style.display = "block";
                        panel.style.maxHeight = panel.scrollHeight + "px";
                    }
                }
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }, 800);
    }
});

// Sposta tutto dentro il DOMContentLoaded per sicurezza
document.addEventListener('DOMContentLoaded', () => {
    // ... (tuo codice esistente per scanner e hamburger) ...

    const container = document.querySelector('.carousel-container');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    if (container && prevBtn && nextBtn) {
        // Definiamo lo scorrimento in base alla larghezza di una card reale
        // Se non trova la card, usa il valore di default 320
        const getScrollAmount = () => {
            const card = container.querySelector('.card, .carousel-item'); // usa la classe delle tue card
            return card ? card.offsetWidth + 20 : 320; 
        };

        nextBtn.onclick = (e) => {
            e.preventDefault();
            container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        };

        prevBtn.onclick = (e) => {
            e.preventDefault();
            container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        };

        // Debug per GitHub: vedi nella console se gli elementi vengono trovati
        console.log("Carosello inizializzato:", { container, prevBtn, nextBtn });
    } else {
        console.error("Errore: Elementi del carosello non trovati nel DOM.");
    }
});
