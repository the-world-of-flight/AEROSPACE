// 1. Controllo Login (eseguito immediatamente)
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

// 2. Gestione Accordion (Unica e corretta)
document.addEventListener("DOMContentLoaded", function() {
    const acc = document.getElementsByClassName("accordion");

    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            // Alterna la classe active per il colore del pulsante
            this.classList.toggle("active");

            // Gestione del pannello con animazione fluida (maxHeight)
            const panel = this.nextElementSibling;
            
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                // Assicuriamoci che non ci sia display: none che blocca tutto
                panel.style.display = "block"; 
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
});

// 3. Bottone "Torna su"
const btnTop = document.createElement("button");
btnTop.textContent = "↑ Torna su";
btnTop.style.position = "fixed";
btnTop.style.bottom = "20px";
btnTop.style.right = "20px";
btnTop.style.padding = "10px 15px";
btnTop.style.display = "none";
btnTop.style.cursor = "pointer";
btnTop.style.zIndex = "1000"; 
btnTop.style.borderRadius = "5px";
btnTop.style.backgroundColor = "#003366";
btnTop.style.color = "white";
btnTop.style.border = "none";

document.body.appendChild(btnTop);

window.addEventListener("scroll", () => {
    btnTop.style.display = window.scrollY > 300 ? "block" : "none";
});

btnTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

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