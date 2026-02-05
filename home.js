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

if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}