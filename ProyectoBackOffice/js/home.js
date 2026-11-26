const API_URL = "https://portfolio-api-three-black.vercel.app/api/v1";

const token = localStorage.getItem("authToken");
if (!token) {
  window.location.href = "login.html";
}

let userData = {};
try {
  userData = JSON.parse(localStorage.getItem("userData") || "{}");
} catch {
  userData = {};
}

const userNameElement = document.getElementById("user-name");
if (userData && userData.name) {
  userNameElement.textContent = userData.name;
}

const btnLogout = document.getElementById("btn-logout");
btnLogout.addEventListener("click", (e) => {
  e.preventDefault();
  cerrarSesion();
});

function cerrarSesion() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  window.location.href = "login.html";
}

function verificarAutenticacion(response) {
  if (response.status === 401 || response.status === 403) {
    cerrarSesion();
    return false;
  }
  return true;
}

const contenedorFormulario = document.getElementById("contenedor-formulario");
const btnToggleForm = document.getElementById("btn-toggle-form");
const formProyecto = document.getElementById("form-proyecto");
const formTitulo = document.getElementById("form-titulo");
const formErrorMessage = document.getElementById("form-error-message");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
const proyectosContenedor = document.getElementById("proyectos-contenedor");

const inputId = document.getElementById("proyecto-id");
const inputTitulo = document.getElementById("proyecto-titulo");
const inputDescripcion = document.getElementById("proyecto-descripcion");
const inputTecnologias = document.getElementById("proyecto-tecnologias");
const inputRepositorio = document.getElementById("proyecto-repositorio");
const inputImagenes = document.getElementById("proyecto-imagenes");

let proyectos = [];

function mostrarErrorForm(mensaje) {
  formErrorMessage.textContent = mensaje;
  formErrorMessage.classList.remove("oculto");
}

function limpiarErrorForm() {
  formErrorMessage.textContent = "";
  formErrorMessage.classList.add("oculto");
}

function resetearFormulario() {
  formProyecto.reset();
  inputId.value = "";
  formTitulo.textContent = "Nuevo Proyecto";
  btnGuardar.textContent = "Guardar Proyecto";
  limpiarErrorForm();
}

btnToggleForm.addEventListener("click", () => {
  if (contenedorFormulario.classList.contains("oculto")) {
    resetearFormulario();
    contenedorFormulario.classList.remove("oculto");
    inputTitulo.focus();
  } else {
    contenedorFormulario.classList.add("oculto");
    resetearFormulario();
  }
});

btnCancelar.addEventListener("click", () => {
  resetearFormulario();
  contenedorFormulario.classList.add("oculto");
});

async function obtenerProyectos() {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "GET",
      headers: {
        "auth-token": token
      }
    });

    if (!verificarAutenticacion(response)) return;

    const data = await response.json();
    proyectos = Array.isArray(data) ? data : (data.projects || data.data || []);
    renderizarProyectos(proyectos);
  } catch (err) {
    proyectosContenedor.innerHTML = '<p class="subtitulo mensaje-grid">Error al cargar proyectos.</p>';
  }
}

function renderizarProyectos(lista) {
  proyectosContenedor.innerHTML = "";

  if (lista.length === 0) {
    proyectosContenedor.innerHTML = '<p class="subtitulo mensaje-grid">No hay proyectos disponibles.</p>';
    return;
  }

  lista.forEach((proyecto) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-proyecto";

    if (proyecto.images && proyecto.images.length > 0 && proyecto.images[0]) {
      const img = document.createElement("img");
      img.src = proyecto.images[0];
      img.alt = proyecto.title;
      img.onerror = () => {
        img.style.display = "none";
      };
      tarjeta.appendChild(img);
    }

    const titulo = document.createElement("h3");
    titulo.className = "tarjeta-proyecto-titulo";
    titulo.textContent = proyecto.title;
    tarjeta.appendChild(titulo);

    const desc = document.createElement("p");
    desc.className = "tarjeta-proyecto-desc";
    desc.textContent = proyecto.description;
    tarjeta.appendChild(desc);

    if (proyecto.technologies && proyecto.technologies.length > 0) {
      const techContenedor = document.createElement("div");
      techContenedor.className = "tech-badges";
      proyecto.technologies.forEach((tech) => {
        const badge = document.createElement("span");
        badge.className = "badge-tech";
        badge.textContent = tech;
        techContenedor.appendChild(badge);
      });
      tarjeta.appendChild(techContenedor);
    }

    if (proyecto.repository) {
      const repoLink = document.createElement("a");
      repoLink.href = proyecto.repository;
      repoLink.target = "_blank";
      repoLink.rel = "noopener noreferrer";
      repoLink.className = "proyecto-enlace";
      repoLink.textContent = "Ver repositorio \u2192";
      tarjeta.appendChild(repoLink);
    }

    const acciones = document.createElement("div");
    acciones.className = "tarjeta-acciones";

    const btnActualizar = document.createElement("button");
    btnActualizar.type = "button";
    btnActualizar.className = "boton-secundario";
    btnActualizar.textContent = "Actualizar";
    btnActualizar.addEventListener("click", () => iniciarEdicion(proyecto._id || proyecto.id));

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "boton-peligro";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", () => eliminarProyecto(proyecto._id || proyecto.id));

    acciones.appendChild(btnActualizar);
    acciones.appendChild(btnEliminar);
    tarjeta.appendChild(acciones);

    proyectosContenedor.appendChild(tarjeta);
  });
}

async function iniciarEdicion(id) {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "GET",
      headers: {
        "auth-token": token
      }
    });

    if (!verificarAutenticacion(response)) return;

    if (!response.ok) {
      const data = await response.json();
      const msg = Array.isArray(data.message) ? data.message.join(". ") : (data.message || data.error || "Error al obtener el proyecto.");
      alert(msg);
      return;
    }

    const proyecto = await response.json();

    resetearFormulario();
    inputId.value = proyecto._id || proyecto.id;
    inputTitulo.value = proyecto.title || "";
    inputDescripcion.value = proyecto.description || "";
    inputTecnologias.value = (proyecto.technologies || []).join(", ");
    inputRepositorio.value = proyecto.repository || "";
    inputImagenes.value = (proyecto.images || []).join(", ");

    formTitulo.textContent = "Actualizar Proyecto";
    btnGuardar.textContent = "Actualizar Proyecto";

    contenedorFormulario.classList.remove("oculto");
    contenedorFormulario.scrollIntoView({ behavior: "smooth" });
    inputTitulo.focus();
  } catch (err) {
    alert(err.message || "Error al obtener el proyecto.");
  }
}

formProyecto.addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarErrorForm();

  const id = inputId.value;
  const title = inputTitulo.value.trim();
  const description = inputDescripcion.value.trim();
  const technologies = inputTecnologias.value
    ? inputTecnologias.value.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const repository = inputRepositorio.value.trim();
  const images = inputImagenes.value
    ? inputImagenes.value.split(",").map((img) => img.trim()).filter(Boolean)
    : [];

  const payload = {
    title,
    description,
    technologies,
    images
  };

  if (repository) {
    payload.repository = repository;
  }

  const esEdicion = Boolean(id);
  const url = esEdicion ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;
  const method = esEdicion ? "PUT" : "POST";

  if (!esEdicion) {
    payload.userId = userData.id || userData._id;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "auth-token": token
      },
      body: JSON.stringify(payload)
    });

    if (!verificarAutenticacion(response)) return;

    const data = await response.json();

    if (response.ok) {
      resetearFormulario();
      contenedorFormulario.classList.add("oculto");
      await obtenerProyectos();
    } else {
      const msg = Array.isArray(data.message) ? data.message.join(". ") : (data.message || data.error || "Error al procesar la solicitud.");
      mostrarErrorForm(msg);
    }
  } catch (err) {
    mostrarErrorForm("Error de conexión al guardar el proyecto.");
  }
});

async function eliminarProyecto(id) {
  if (!confirm("¿Deseas eliminar este proyecto?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "DELETE",
      headers: {
        "auth-token": token
      }
    });

    if (!verificarAutenticacion(response)) return;

    if (response.ok) {
      await obtenerProyectos();
    } else {
      const data = await response.json();
      alert(data.message || "Error al eliminar el proyecto.");
    }
  } catch (err) {
    alert("Error de conexión al eliminar el proyecto.");
  }
}

obtenerProyectos();
