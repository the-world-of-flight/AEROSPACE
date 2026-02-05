function mostraPassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggleBtn');

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleBtn.textContent = "Nascondi"; // Cambia il testo del pulsante
    } else {
        passwordInput.type = "password";
        toggleBtn.textContent = "Mostra";
    }
}

// La tua funzione originale rimane invariata
function controlla() {
    const passwordInput = document.getElementById('password');

    if (passwordInput.value === 'MIIS017001') {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
    } else {
        alert("Password errata!");
    }
}

// Permette di premere Invio per fare il login
document.getElementById('password').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        controlla();
    }
});