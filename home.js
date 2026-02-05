// Seleziono la prima card
const card1 = document.querySelector(".card");

// Quando clicco sulla prima card, apro la pagina collegata
card1.addEventListener("click", () => {
    window.location.href = "olla.html";  // pagina di destinazione
});

// Seleziono la seconda card
const card2 = document.querySelector(".card2");

// Quando clicco sulla seconda card, apro la pagina collegata
card2.addEventListener("click", () => {
    window.location.href = "calo.html"; // pagina di destinazione
});
const card3 = document.querySelector(".card3");

card3.addEventListener("click", () => {
    window.location.href = "maffucci.html"; // pagina di destinazione
});

const card4 = document.querySelector(".card4");

card4.addEventListener("click", () => {
    window.location.href = "pagina di cortesia.html"; // pagina di destinazione
});


if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

// --- SCUDO GLOBALE ANTI-BAN ---
(function() {
    const oraCorrente = new Date().getTime();
    
    // 1. CHIAVE DI EMERGENZA (Sblocca se l'URL ha ?reset=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('reset')) {
        localStorage.removeItem("banUntil");
        localStorage.removeItem("visitePaginaNovecento");
        alert("Chiave accettata. Accesso ripristinato!");
        window.location.href = window.location.pathname; 
        return;
    }

    // 2. CONTROLLO BAN ATTIVO
    const tempoBlocco = localStorage.getItem("banUntil");
    if (tempoBlocco && oraCorrente < tempoBlocco) {
        const millisecondi = tempoBlocco - oraCorrente;
        const ore = Math.floor(millisecondi / (1000 * 60 * 60));
        const min = Math.floor((millisecondi % (1000 * 60 * 60)) / (1000 * 60));

        // Cancella tutto il contenuto della pagina e mostra il blocco
        document.documentElement.innerHTML = `
            <body style="background:#000; color:#ff0000; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; font-family:sans-serif; margin:0;">
                <h1 style="font-size:3em; border-bottom: 2px solid red;">ACCESSO NEGATO</h1>
                <p style="font-size:1.5em; color:white;">Sei stato bannato per aver abusato del sito.</p>
                <p>Potrai rientrare tra <strong>${ore} ore e ${min} minuti</strong>.</p>
                <p style="margin-top:30px; color:#444;">ID Blocco: AEROSPACE-SECURITY-900</p>
            </body>`;
        
        window.stop(); // Ferma il caricamento di script esterni
        throw new Error("Utente bannato."); // Blocca l'esecuzione del codice successivo
    }
})();