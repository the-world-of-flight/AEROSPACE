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

    const pagine = ["olla.html", "index.html", "maffucci.html", "olla2.html", "calo.html", "sesta-generazione.html"];

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
function avviaDropC130() {
    const dropZone = document.getElementById("dropZone");
    const plane = document.getElementById("c130Pass");
    if (!dropZone || !plane) return;

    const payloads = [
        { img: "IMG_1726.JPG.jpeg", href: "olla.html", title: "Interdisciplinarietà", left: 14, top: 58 },
        { img: "image2.jpeg", href: "olla2.html", title: "Eroi nello spazio", left: 31, top: 66 },
        { img: "image3.jpeg", href: "calo.html", title: "Leggenda e progresso", left: 49, top: 60 },
        { img: "image4.jpeg", href: "maffucci.html", title: "Post-eroismo", left: 67, top: 68 },
        { img: "image5.jpeg", href: "sesta-generazione.html", title: "Sesta generazione", left: 84, top: 60 }
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
        const node = document.createElement("a");
        node.className = "payload";
        node.href = item.href;
        node.setAttribute("aria-label", `Apri ${item.title}`);

        const targetXpx = (item.left / 100) * window.innerWidth;
        const dropStopYpx = Math.min(window.innerHeight * 0.68, start.y + window.innerHeight * 0.34);

        node.style.left = `${targetXpx}px`;
        node.style.top = `${start.y}px`;

        node.innerHTML = `
            <span class="parachute-canopy"></span>
            <span class="parachute-lines"></span>
            <span class="parachute-lines"></span>
            <span class="payload-title">${item.title}</span>
            <img src="${item.img}" class="drop-image" alt="Anteprima ${item.title}">
        `;

        dropZone.appendChild(node);

        requestAnimationFrame(() => {
            node.classList.add("active");
            node.style.top = `${dropStopYpx}px`;
        });

        setTimeout(() => {
            node.classList.add("parachute-open");
            node.style.left = `${item.left}%`;
            node.style.top = `${item.top}%`;

            setTimeout(() => {
                node.classList.add("landed");
            }, 2200);
        }, 1000);
    };

    const controllaSgancio = () => {
        if (indiceDrop >= payloads.length) return;

        const tail = getTailPoint();
        const prossimo = payloads[indiceDrop];
        const sogliaX = (prossimo.left / 100) * window.innerWidth;

        const haAttraversato =
            prevTailX !== null &&
            prevTailX < sogliaX &&
            tail.x >= sogliaX;

        if (haAttraversato) {
            creaPayload(prossimo, tail);
            indiceDrop += 1;
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






