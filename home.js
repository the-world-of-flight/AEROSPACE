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

// --- 2. SCANNER OTTIMIZZATO ---
let indiceAutomatico = [];

async function avviaScanner() {
    const cache = sessionStorage.getItem("indiceRicerca");
    if (cache) {
        indiceAutomatico = JSON.parse(cache);
        return;
    }

    const pagine = ["olla.html", "index.html", "maffucci.html", "olla2.html", "calo.html"];
    
    for (const url of pagine) {
        try {
            // Se siamo già sulla pagina, usiamo il documento attuale senza fetch
            let doc;
            if (window.location.pathname.includes(url)) {
                doc = document;
            } else {
                const response = await fetch(url, { priority: 'low' });
                if (!response.ok) continue;
                const htmlText = await response.text();
                const pulito = htmlText.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
                doc = new DOMParser().parseFromString(pulito, 'text/html');
            }

            const sezioni = doc.querySelectorAll('section[id]');
            sezioni.forEach(s => {
                const titolo = s.querySelector('h2, .accordion, .section-title')?.innerText.trim() || "Argomento";
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
            console.warn("Errore scansione:", url, e);
        }
    }
    sessionStorage.setItem("indiceRicerca", JSON.stringify(indiceAutomatico));
}

// --- 3. RICERCA ---
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
            div.style.padding = "10px"; // Assicuriamoci che sia cliccabile
            div.style.cursor = "pointer";
            div.onclick = () => window.location.href = item.url;
            list.appendChild(div);
        });
    } else {
        list.style.display = 'none';
    }
}

// --- 4. INIZIALIZZAZIONE ---
document.addEventListener('DOMContentLoaded', () => {
    avviaScanner();

    // Menu Hamburger
    const hb = document.getElementById('hamburger');
    const ms = document.getElementById('menuScreen');
    if (hb && ms) {
        hb.onclick = () => {
            hb.classList.toggle('open');
            ms.classList.toggle('open');
        };
    }

    // Ricerca
    const searchBar = document.getElementById('searchInput');
    if (searchBar) searchBar.oninput = eseguiRicerca;

    // --- CAROSELLO INFINITO (LOGICA FIXATA) ---
    // Usiamo cardrow perché nel tuo CSS è quello con overflow-x: auto
    const slider = document.querySelector('.cardrow');
    const btnP = document.getElementById('prevBtn');
    const btnN = document.getElementById('nextBtn');

    if (slider && btnP && btnN) {
        const step = 300; 

        btnN.onclick = () => {
            const isAtEnd = slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 10;
            if (isAtEnd) {
                slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: step, behavior: 'smooth' });
            }
        };

        btnP.onclick = () => {
            const isAtStart = slider.scrollLeft <= 10;
            if (isAtStart) {
                slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: -step, behavior: 'smooth' });
            }
        };
    }
});