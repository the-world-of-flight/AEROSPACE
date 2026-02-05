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