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

  const name = document.getElementById("nombre").value.trim();
  const itsonId = document.getElementById("itsonId").value.trim();
  const email = document.getElementById("correo").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmar-password").value;

  if (name.length < 6) {
    mostrarError("El nombre debe tener al menos 6 caracteres.");
    return;
  }

  if (!/^\d{6}$/.test(itsonId)) {
    mostrarError("El ID ITSON debe contener exactamente 6 dígitos numéricos.");
    return;
  }

  if (password.length < 6) {
    mostrarError("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (password !== confirmPassword) {
    mostrarError("Las contraseñas no coinciden.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, itsonId, password })
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = "login.html";
    } else {
      const msg = Array.isArray(data.message) ? data.message.join(". ") : (data.message || data.error || "Error al registrarse.");
      mostrarError(msg);
    }
  } catch (err) {
    mostrarError("Error al conectar con el servidor.");
  }
});
