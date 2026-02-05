// Bottone "torna su"
const btn = document.createElement("button");// Creazione del bottone
btn.textContent = "↑ Torna su";// Testo del bottone
btn.style.position = "fixed";// Posizione fissa
btn.style.bottom = "20px";// Distanza dal fondo
btn.style.right = "20px";// Distanza dal lato destro
btn.style.padding = "10px 15px";// Padding
btn.style.display = "none";// Inizialmente nascosto
btn.style.cursor = "pointer";// Puntatore a mano

document.body.appendChild(btn);// Aggiunta del bottone al corpo del documento

window.addEventListener("scroll", () => {// Evento di scroll
    btn.style.display = window.scrollY > 300 ? "block" : "none";// Mostra il bottone se si scorre oltre 300px
});

btn.addEventListener("click", () => {// Evento di click sul bottone
    window.scrollTo({ top: 0, behavior: "smooth" });// Scrolla verso l'alto in modo fluido
});

const acc = document.querySelectorAll(".accordion");// Seleziona tutti gli elementi con la classe "accordion"

  acc.forEach(btn => {// Per ogni bottone accordion
    btn.addEventListener("click", function () {// Aggiunge un evento di click
      this.classList.toggle("active");// Toggle della classe "active"
      const panel = this.nextElementSibling;// Seleziona il pannello successivo
      panel.style.display = panel.style.display === "block" ? "none" : "block";// Toggle della visualizzazione del pannello
    });
  });

  function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}