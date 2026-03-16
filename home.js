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

// --- 2. SCANNER OTTIMIZZATO PER RICERCA ---
let indiceAutomatico = [];

async function avviaScanner() {
    const cache = sessionStorage.getItem("indiceRicerca");
    if (cache) {
        indiceAutomatico = JSON.parse(cache);
        return;
    }

    const pagine = ["index.html", "olla.html", "olla2.html", "calo.html", "maffucci.html", "sesta-generazione.html", "chisiamo.html", "login.html"];

    for (const url of pagine) {
        try {
            let doc;
            if (window.location.pathname.includes(url)) {
                doc = document;
            } else {
                const response = await fetch(url, { priority: "low" });
                if (!response.ok) continue;
                const htmlText = await response.text();
                const pulito = htmlText.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
                doc = new DOMParser().parseFromString(pulito, "text/html");
            }

            const sezioni = doc.querySelectorAll("section[id]");
            sezioni.forEach((s) => {
                const titolo = s.querySelector("h2, .accordion, .section-title")?.innerText.trim() || "Argomento";
                const linkCompleto = `${url}#${s.id}`;

                if (!indiceAutomatico.some((item) => item.url === linkCompleto)) {
                    indiceAutomatico.push({
                        titolo,
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

// --- 3. LOGICA RICERCA ---
function eseguiRicerca() {
    const input = document.getElementById("searchInput");
    const list = document.getElementById("resultsList");
    if (!input || !list) return;

    const query = input.value.toLowerCase().trim();
    if (query.length < 2) {
        list.style.display = "none";
        return;
    }

    const filtrati = indiceAutomatico.filter((item) =>
        item.testo.includes(query) || item.titolo.toLowerCase().includes(query)
    );

    list.innerHTML = "";
    if (filtrati.length > 0) {
        list.style.display = "block";
        filtrati.slice(0, 10).forEach((item) => {
            const div = document.createElement("div");
            div.className = "result-item";
            div.innerHTML = `<strong>${item.titolo}</strong>`;
            div.style.padding = "10px";
            div.style.cursor = "pointer";
            div.onclick = () => { window.location.href = item.url; };
            list.appendChild(div);
        });
    } else {
        list.style.display = "none";
    }
}

// --- 4. DROP C130 CON IMMAGINI FISSE CLICCABILI ---
let dropRunId = 0;

function avviaDropC130() {
    const dropZone = document.getElementById("dropZone");
    const plane = document.getElementById("c130Pass");
    if (!dropZone || !plane) return;

    // Nuova run: invalida eventuali loop/timeout della run precedente.
    dropRunId += 1;
    const runId = dropRunId;

    // Reset visivo della scena per evitare stati sporchi al rientro in pagina.
    dropZone.innerHTML = "";
    plane.style.animation = "none";
    void plane.offsetWidth;
    plane.style.animation = "c130Pass 11s linear 1 forwards";

    const payloads = [
        { img: "IMG_1726.JPG.jpeg", href: "olla.html", title: "Interdisciplinarietà dell'aerospazio", left: 14, top: 58 },
        { img: "eroi del cielo.jpeg", href: "olla2.html", title: "Eroi nello spazio", left: 31, top: 66 },
        { img: "IMG_0272.jpeg", href: "calo.html", title: "Dalla leggenda al progresso", left: 49, top: 60 },
        { img: "post eroismo.jpg", href: "maffucci.html", title: "Post-eroismo", left: 67, top: 68 },
        { img: "image3.jpeg", href: "sesta-generazione.html", title: "Sesta generazione", left: 84, top: 60 }
    ];

    let indiceDrop = 0;
    let prevTailX = null;

    const getTailPoint = () => {
        const rect = plane.getBoundingClientRect();
        return {
            // Punto del portellone posteriore sul C-130 (immagine specchiata)
            x: rect.left + rect.width * 0.22,
            y: rect.top + rect.height * 0.62
        };
    };

    const creaPayload = (item, start) => {
        if (runId !== dropRunId) return;

        const node = document.createElement("a");
        node.className = "payload";
        node.href = item.href;
        node.setAttribute("aria-label", `Apri ${item.title}`);

        const ejectXpx = Math.min(window.innerWidth - 24, start.x + 38 + Math.random() * 56);
        const dropStopYpx = Math.min(window.innerHeight * 0.7, start.y + window.innerHeight * (0.2 + Math.random() * 0.1));
        const spinStart = -8 + Math.random() * 16;
        const spinEnd = -24 + Math.random() * 48;

        node.style.left = `${start.x}px`;
        node.style.top = `${start.y}px`;
        node.style.setProperty("--spin-start", `${spinStart}deg`);
        node.style.setProperty("--spin-end", `${spinEnd}deg`);

        node.innerHTML = `
            <span class="parachute-canopy"></span>
            <span class="parachute-rig">
                <span class="parachute-line l1"></span>
                <span class="parachute-line l2"></span>
                <span class="parachute-line l3"></span>
                <span class="parachute-line l4"></span>
                <span class="parachute-line l5"></span>
            </span>
            <span class="payload-title">${item.title}</span>
            <img src="${item.img}" class="drop-image" alt="Anteprima ${item.title}">
        `;

        dropZone.appendChild(node);

        requestAnimationFrame(() => {
            if (runId !== dropRunId) return;
            node.classList.add("active");
            node.classList.add("ejected");
            node.style.left = `${ejectXpx}px`;
            node.style.top = `${dropStopYpx}px`;
        });

        setTimeout(() => {
            if (runId !== dropRunId) return;
            node.classList.add("parachute-open");
            node.style.left = `${item.left}%`;
            node.style.top = `${item.top}%`;

            setTimeout(() => {
                if (runId !== dropRunId) return;
                node.classList.add("landed");
            }, 2200);
        }, 800);
    };

    const controllaSgancio = () => {
        if (runId !== dropRunId) return;
        if (indiceDrop >= payloads.length) return;

        const tail = getTailPoint();
        if (prevTailX !== null) {
            // Se il browser salta frame (tab in background o lag), sgancia tutte le soglie attraversate.
            while (indiceDrop < payloads.length) {
                const prossimo = payloads[indiceDrop];
                const sogliaX = (prossimo.left / 100) * window.innerWidth;
                const haAttraversato = prevTailX < sogliaX && tail.x >= sogliaX;
                if (!haAttraversato) break;
                creaPayload(prossimo, tail);
                indiceDrop += 1;
            }
        }

        prevTailX = tail.x;
        requestAnimationFrame(controllaSgancio);
    };

    requestAnimationFrame(controllaSgancio);
}

// --- 5. INIZIALIZZAZIONE ---
document.addEventListener("DOMContentLoaded", () => {
    avviaScanner();

    const hb = document.getElementById("hamburger");
    const ms = document.getElementById("menuScreen");
    if (hb && ms) {
        hb.onclick = () => {
            hb.classList.toggle("open");
            ms.classList.toggle("open");
        };
    }

    const searchBar = document.getElementById("searchInput");
    if (searchBar) {
        searchBar.oninput = eseguiRicerca;
    }

    avviaDropC130();
});

// Ripristina correttamente la scena se la pagina torna dalla cache del browser (back/forward).
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        avviaDropC130();
    }
});









