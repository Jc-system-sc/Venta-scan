/* ==========================================================================
   VENTAS.JS
   - Escaneo de códigos EAN con la cámara (Html5Qrcode)
   - Búsqueda manual para productos sin código de barras legible
   - Lista de venta activa con controles de cantidad
   ========================================================================== */

function initVentas() {
  document.getElementById("btn-escanear").addEventListener("click", toggleEscaner);
  document.getElementById("buscar-manual").addEventListener("input", (e) => {
    renderResultadosManual(e.target.value);
  });
  document.getElementById("btn-confirmar-venta").addEventListener("click", abrirModalCliente);
  document.getElementById("btn-vaciar-venta").addEventListener("click", () => {
    if (RosaState.venta.length === 0) return;
    if (confirm("¿Vaciar la lista de venta actual?")) {
      RosaState.venta = [];
      renderVenta();
    }
  });

  renderVenta();
}

/* ---------------------- Escáner de cámara ---------------------- */

function toggleEscaner() {
  if (RosaState.scannerActivo) {
    detenerEscaner();
  } else {
    iniciarEscaner();
  }
}

function iniciarEscaner() {
  const contenedor = document.getElementById("qr-reader");
  const placeholder = document.getElementById("scanner-placeholder");
  const overlay = document.getElementById("scanner-overlay");
  const btn = document.getElementById("btn-escanear");

  if (typeof Html5Qrcode === "undefined") {
    mostrarToast("No se pudo cargar la librería de escaneo", "error");
    return;
  }

  placeholder.classList.add("hidden");
  overlay.classList.remove("hidden");
  contenedor.classList.remove("hidden");
  btn.innerHTML = iconoDetener() + "Detener escáner";

  RosaState.html5QrCode = new Html5Qrcode("qr-reader");
  const config = { fps: 12, qrbox: { width: 230, height: 140 }, aspectRatio: 1.33 };

  RosaState.html5QrCode
    .start({ facingMode: "environment" }, config, onEscaneoExitoso, () => {
      /* callback de error por frame: se ignora, se dispara constantemente
         mientras no hay un código en cuadro */
    })
    .then(() => {
      RosaState.scannerActivo = true;
    })
    .catch((err) => {
      console.error(err);
      mostrarToast("No se pudo acceder a la cámara. Revisa los permisos.", "error");
      placeholder.classList.remove("hidden");
      overlay.classList.add("hidden");
      btn.innerHTML = iconoCamara() + "Iniciar escáner";
    });
}

function detenerEscaner() {
  const placeholder = document.getElementById("scanner-placeholder");
  const overlay = document.getElementById("scanner-overlay");
  const btn = document.getElementById("btn-escanear");

  if (RosaState.html5QrCode && RosaState.scannerActivo) {
    RosaState.html5QrCode
      .stop()
      .then(() => RosaState.html5QrCode.clear())
      .catch(() => {});
  }
  RosaState.scannerActivo = false;
  placeholder.classList.remove("hidden");
  overlay.classList.add("hidden");
  btn.innerHTML = iconoCamara() + "Iniciar escáner";
}

// Evita añadir el mismo código dos veces en menos de un segundo (rebote de la cámara)
let ultimoEscaneo = { codigo: "", hora: 0 };

function onEscaneoExitoso(decodedText) {
  const ahora = Date.now();
  if (decodedText === ultimoEscaneo.codigo && ahora - ultimoEscaneo.hora < 1200) return;
  ultimoEscaneo = { codigo: decodedText, hora: ahora };

  const producto = buscarProductoPorEAN(decodedText);
  const etiqueta = document.getElementById("scan-last");

  if (producto) {
    RosaAudio.beepEscaneo();
    agregarProductoAVenta(producto);
    etiqueta.textContent = `✓ ${producto.nombre}`;
  } else {
    RosaAudio.beepNoEncontrado();
    etiqueta.textContent = `Código ${decodedText} no está en el catálogo`;
    mostrarToast("Producto no encontrado. Regístralo en Catálogo.", "error");
  }
}

/* ---------------------- Búsqueda manual ---------------------- */

function renderResultadosManual(query) {
  const cont = document.getElementById("resultados-manual");
  if (!query.trim()) {
    cont.innerHTML = "";
    cont.classList.add("hidden");
    return;
  }
  const resultados = buscarProductos(query).slice(0, 6);
  cont.classList.remove("hidden");

  if (resultados.length === 0) {
    cont.innerHTML = `<div class="list-row"><div class="list-meta">Sin resultados</div></div>`;
    return;
  }

  cont.innerHTML = resultados
    .map(
      (p) => `
      <div class="list-row" data-id="${p.id}" style="cursor:pointer">
        <div class="list-info">
          <div class="list-name">${escaparHTML(p.nombre)}</div>
          <div class="list-meta">EAN ${escaparHTML(p.ean)}</div>
        </div>
        <div class="pill pill-green">${formatoMoneda(p.precio)}</div>
      </div>`
    )
    .join("");

  cont.querySelectorAll(".list-row").forEach((row) => {
    row.addEventListener("click", () => {
      const producto = RosaState.productos.find((p) => p.id === row.dataset.id);
      if (producto) {
        agregarProductoAVenta(producto);
        document.getElementById("buscar-manual").value = "";
        cont.innerHTML = "";
        cont.classList.add("hidden");
      }
    });
  });
}

/* ---------------------- Lista de venta activa ---------------------- */

function agregarProductoAVenta(producto) {
  const existente = RosaState.venta.find((i) => i.id === producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    RosaState.venta.push({
      id: producto.id,
      ean: producto.ean,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }
  renderVenta();
}

function cambiarCantidad(id, delta) {
  const item = RosaState.venta.find((i) => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    RosaState.venta = RosaState.venta.filter((i) => i.id !== id);
  }
  renderVenta();
}

function eliminarDeVenta(id) {
  RosaState.venta = RosaState.venta.filter((i) => i.id !== id);
  renderVenta();
}

function calcularTotalVenta() {
  return RosaState.venta.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
}

function renderVenta() {
  const cont = document.getElementById("lista-venta");
  const totalEl = document.getElementById("total-venta");
  const btnConfirmar = document.getElementById("btn-confirmar-venta");
  const btnVaciar = document.getElementById("btn-vaciar-venta");
  const contador = document.getElementById("contador-venta");

  if (RosaState.venta.length === 0) {
    cont.innerHTML = `
      <div class="empty-state">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
        <div>Escanea o busca un producto para empezar la venta.</div>
      </div>`;
    btnConfirmar.disabled = true;
    btnVaciar.disabled = true;
  } else {
    cont.innerHTML = RosaState.venta
      .map(
        (i) => `
        <div class="sale-item">
          <div class="sale-item-info">
            <div class="sale-item-name">${escaparHTML(i.nombre)}</div>
            <div class="sale-item-price">${formatoMoneda(i.precio)} c/u</div>
          </div>
          <div class="qty-control">
            <button class="qty-btn" data-action="menos" data-id="${i.id}">−</button>
            <span class="qty-val">${i.cantidad}</span>
            <button class="qty-btn" data-action="mas" data-id="${i.id}">+</button>
          </div>
          <div class="sale-item-total">${formatoMoneda(i.precio * i.cantidad)}</div>
          <button class="remove-btn" data-action="borrar" data-id="${i.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>`
      )
      .join("");

    cont.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (btn.dataset.action === "mas") cambiarCantidad(id, 1);
        if (btn.dataset.action === "menos") cambiarCantidad(id, -1);
        if (btn.dataset.action === "borrar") eliminarDeVenta(id);
      });
    });

    btnConfirmar.disabled = false;
    btnVaciar.disabled = false;
  }

  totalEl.textContent = formatoMoneda(calcularTotalVenta());
  const totalItems = RosaState.venta.reduce((acc, i) => acc + i.cantidad, 0);
  contador.textContent = totalItems > 0 ? `${totalItems} producto${totalItems === 1 ? "" : "s"}` : "";
}

function iconoCamara() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/></svg>`;
}
function iconoDetener() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;
}
