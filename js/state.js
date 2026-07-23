/* ==========================================================================
   STATE.JS
   Estado global de la app + helpers reutilizados por los demás módulos.
   ========================================================================== */

const RosaState = {
  db: null,                 // instancia de Firestore
  firebaseListo: false,     // true si la conexión a Firebase se inicializó bien
  productos: [],            // caché local del catálogo, sincronizada en tiempo real
  venta: [],                // items de la venta activa: {id, ean, nombre, precio, cantidad}
  scannerActivo: false,
  html5QrCode: null
};

/** Formatea un número como moneda, ej: 19.9 -> "S/ 19.90" */
function formatoMoneda(valor) {
  const n = Number(valor) || 0;
  return `${NEGOCIO.moneda} ${n.toFixed(2)}`;
}

/** Busca un producto en la caché local por EAN exacto */
function buscarProductoPorEAN(ean) {
  return RosaState.productos.find((p) => p.ean === ean.trim());
}

/** Busca productos por coincidencia parcial de nombre o EAN */
function buscarProductos(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return RosaState.productos.filter(
    (p) => p.nombre.toLowerCase().includes(q) || p.ean.includes(q)
  );
}

/** Muestra una notificación flotante breve */
let toastTimer = null;
function mostrarToast(mensaje, tipo = "ok") {
  const toast = document.getElementById("toast");
  const texto = document.getElementById("toast-text");
  texto.textContent = mensaje;
  toast.classList.toggle("error", tipo === "error");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/** Actualiza el punto de estado (verde/rojo) del encabezado */
function actualizarEstadoConexion(ok) {
  const dot = document.getElementById("status-dot");
  const label = document.getElementById("status-label");
  if (ok) {
    dot.classList.add("online");
    dot.classList.remove("offline");
    label.textContent = "Conectado";
  } else {
    dot.classList.add("offline");
    dot.classList.remove("online");
    label.textContent = "Sin conexión a Firebase";
  }
}
