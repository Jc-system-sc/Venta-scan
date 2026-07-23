/* ==========================================================================
   UI.JS
   Cambia de pestaña (Vender / Catálogo / Precios) y controla los modales.
   ========================================================================== */

function cambiarPestana(nombre) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.toggle("active", el.dataset.screen === nombre);
  });
  document.querySelectorAll(".tab-btn").forEach((el) => {
    el.classList.toggle("active", el.dataset.tab === nombre);
  });

  document.getElementById("total-bar").classList.toggle("hidden", nombre !== "vender");

  // Si el usuario sale de "Vender", apagamos la cámara para no gastar batería.
  if (nombre !== "vender" && RosaState.scannerActivo) {
    detenerEscaner();
  }
  // Si entra a "Precios", refrescamos la lista completa.
  if (nombre === "precios") {
    renderListaPrecios("");
  }
}

function abrirModal(id) {
  document.getElementById(id).classList.add("open");
}
function cerrarModal(id) {
  document.getElementById(id).classList.remove("open");
}

function initUI() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => cambiarPestana(btn.dataset.tab));
  });

  document.getElementById("btn-guia").addEventListener("click", () => abrirModal("modal-guia"));
  document.getElementById("cerrar-guia").addEventListener("click", () => cerrarModal("modal-guia"));

  // Cerrar modales al tocar el fondo oscuro
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.remove("open");
    });
  });
}
