const API_URL = "https://portfolio-api-three-black.vercel.app/api/v1";

if (localStorage.getItem("authToken")) {
  window.location.href = "home.html";
}

const form = document.querySelector(".formulario");
const errorMessage = document.getElementById("error-message");

function mostrarError(mensaje) {
  errorMessage.textContent = mensaje;
  errorMessage.classList.remove("oculto");
}

function limpiarError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("oculto");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarError();

  const email = document.getElementById("correo").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.status === 200) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      window.location.href = "home.html";
    } else {
      const msg = Array.isArray(data.message) ? data.message.join(". ") : (data.message || data.error || "Credenciales incorrectas.");
      mostrarError(msg);
    }
  } catch (err) {
    mostrarError("Error al conectar con el servidor.");
  }
});
