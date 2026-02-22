// --- LOGICA SCANNER UNIVERSALE E SICURA ---
let indiceAutomatico = [];

async function avviaScanner() {
    // 1. IL SEMAFORO: Se i dati esistono già, fermati immediatamente.
    const cache = sessionStorage.getItem("indiceRicerca");
    if (cache) {
        indiceAutomatico = JSON.parse(cache);
        console.log("Scanner: Dati recuperati dalla sessione.");
        return;
    }

    // 2. PROTEZIONE ANTI-LOOP: Se questa istanza è un "fantasma" creato da una fetch, abortisci.
    if (window.name === "scanner_running") return;

    // 3. LOCK DI SICUREZZA: Segniamo che lo scanner sta partendo per evitare doppie esecuzioni
    sessionStorage.setItem("indiceRicerca", "LOADING..."); 

    const pagine = ["index.html", "olla.html", "olla2.html", "calo.html", "maffucci.html", "sesta-generazione.html", "chisiamo.html", "login.html"];
    const parser = new DOMParser();

    console.log("Scanner: Avvio indicizzazione unica...");

    for (const url of pagine) {
        // 4. SALTA LA PAGINA CORRENTE: Non scaricare mai la pagina in cui ti trovi.
        if (window.location.pathname.includes(url)) continue;

        try {
            // Priority low e cache forzata per non pesare sulla rete
            const response = await fetch(url, { priority: 'low', cache: 'force-cache' });
            if (!response.ok) continue;
            
            const htmlText = await response.text();
            
            // Creiamo un documento virtuale
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            // PULIZIA AGGRESSIVA: Rimuoviamo script e immagini per liberare RAM istantaneamente
            doc.querySelectorAll("script, img, video, style, iframe").forEach(el => el.remove());

            const sezioni = doc.querySelectorAll('section[id]');
            
            sezioni.forEach(s => {
                const titolo = s.querySelector('h2, .accordion, h1')?.innerText.trim() || "Argomento";
                const id = s.id;
                
                indiceAutomatico.push({
                    titolo: titolo,
                    testo: s.innerText.toLowerCase().substring(0, 500), // Solo i primi 500 caratteri per risparmiare 2GB di RAM
                    url: url + "#" + id
                });
            });

            // Svuota il documento virtuale per forzare il Garbage Collector
            doc.documentElement.innerHTML = "";
        } catch (e) {
            console.warn("Scanner: Salto " + url + " a causa di un errore.");
        }
    }
    
    // 5. SALVATAGGIO FINALE
    sessionStorage.setItem("indiceRicerca", JSON.stringify(indiceAutomatico));
    console.log("Scanner: Completato. RAM al sicuro.");
}
