function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}
// ==========================================
// 1. SISTEMA DI SICUREZZA: BAN 24H E RESET
// ==========================================

(function gestisciSicurezza() {
    const oraCorrente = new Date().getTime();
    
    // Chiave di sblocco segreta tramite URL (?reset=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('reset')) {
        localStorage.removeItem("banUntil");
        localStorage.removeItem("visitePaginaNovecento");
        alert("Chiave segreta accettata: Ban rimosso!");
        window.location.href = window.location.pathname; 
        return;
    }

    // Verifica se l'utente è attualmente bannato
    const tempoBlocco = localStorage.getItem("banUntil");
    if (tempoBlocco && oraCorrente < tempoBlocco) {
        const millisecondi = tempoBlocco - oraCorrente;
        const ore = Math.floor(millisecondi / (1000 * 60 * 60));
        const min = Math.floor((millisecondi % (1000 * 60 * 60)) / (1000 * 60));

        document.body.innerHTML = `
            <div style="background:#000; color:#ff0000; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; font-family:serif; padding:20px;">
                <h1 style="font-size:3em; border-bottom: 2px solid red;">ACCESSO NEGATO</h1>
                <p style="font-size:1.5em; color:white;">Hai abusato del tasto Home troppe volte nello stesso giorno.</p>
                <p style="font-size:1.2em;">Potrai rientrare tra <strong>${ore} ore e ${min} minuti</strong>.</p>
                <p style="margin-top:50px; color:#444; font-size:0.8em;">Codice Errore: POST-EROISMO-NOVECE-900</p>
            </div>`;
        window.stop();
        throw new Error("Ban attivo.");
    }

    // Controllo Login Standard
    if (localStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
    }
})();

// ==========================================
// 2. FUNZIONE TASTO HOME "MALEDETTO"
// ==========================================

function homePericolosa() {
    const oraCorrente = new Date().getTime();
    let visite = parseInt(localStorage.getItem("visitePaginaNovecento") || "0");
    const ultimaVisita = localStorage.getItem("dataUltimaVisitaNovecento");
    const oggi = new Date().toLocaleDateString();

    // Reset del contatore se è un nuovo giorno
    if (ultimaVisita !== oggi) {
        visite = 0;
        localStorage.setItem("dataUltimaVisitaNovecento", oggi);
    }

    visite++;
    localStorage.setItem("visitePaginaNovecento", visite);

    if (visite >= 3) {
        // Scatta il blocco di 24 ore
        const banTime = oraCorrente + (24 * 60 * 60 * 1000);
        localStorage.setItem("banUntil", banTime);
        localStorage.removeItem("loggedIn"); // Lo butta fuori per sicurezza
        alert("Ti avevo avvertito. Accesso negato per 24 ore.");
        window.location.href = "login.html";
    } else {
        alert(`ATTENZIONE: Hai usato questo tasto ${visite} volte oggi. Alla 3ª volta verrai bannato per 24 ore!`);
        window.location.href = "index.html";
    }
}

// ==========================================
// 3. GESTIONE ACCORDION FLUIDI
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    const acc = document.getElementsByClassName("accordion");

    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            // Attiva/disattiva classe per stile pulsante e freccia
            this.classList.toggle("active");

            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.display = "block"; // Assicura visibilità
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
});

// ==========================================
// 4. BOTTONE TORNA SU E LOGOUT
// ==========================================

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

const btnTop = document.createElement("button");
btnTop.innerHTML = "↑";
btnTop.style.cssText = "position:fixed; bottom:20px; right:20px; padding:10px 15px; display:none; cursor:pointer; z-index:1000; border-radius:50%; background:#003366; color:white; border:none; font-weight:bold; box-shadow: 0 4px 8px rgba(0,0,0,0.3);";

document.body.appendChild(btnTop);

window.addEventListener("scroll", () => {
    btnTop.style.display = window.scrollY > 300 ? "block" : "none";
});

btnTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
//per sbloccarlo aggiungi ?reset=true all'url della pagina o localStorage.clear()