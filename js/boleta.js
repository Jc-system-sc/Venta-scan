/* ==========================================================================
   BOLETA.JS
   Al confirmar la venta: pide datos del cliente, arma la boleta,
   la exporta como PNG (html2canvas) y ofrece enviarla por WhatsApp.
   ========================================================================== */

let ultimaVentaParaBoleta = null;

function abrirModalCliente() {
  if (RosaState.venta.length === 0) return;
  document.getElementById("input-cliente-nombre").value = "";
  document.getElementById("input-cliente-telefono").value = "";
  abrirModal("modal-cliente");
  setTimeout(() => document.getElementById("input-cliente-nombre").focus(), 200);
}

function initBoleta() {
  document.getElementById("form-cliente").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("input-cliente-nombre").value.trim();
    const telefono = document.getElementById("input-cliente-telefono").value.trim();

    if (!nombre) {
      mostrarToast("Ingresa el nombre del cliente", "error");
      return;
    }

    cerrarModal("modal-cliente");
    generarBoleta(nombre, telefono);
  });

  document.getElementById("cerrar-cliente").addEventListener("click", () => cerrarModal("modal-cliente"));
  document.getElementById("cerrar-boleta").addEventListener("click", () => {
    cerrarModal("modal-boleta");
    // Nueva venta: limpiamos la lista activa una vez cerrada la boleta
    RosaState.venta = [];
    renderVenta();
  });

  document.getElementById("btn-descargar-boleta").addEventListener("click", descargarBoletaPNG);
  document.getElementById("btn-whatsapp-boleta").addEventListener("click", enviarBoletaWhatsApp);
}

function generarBoleta(nombreCliente, telefono) {
  const items = [...RosaState.venta];
  const total = calcularTotalVenta();
  const fecha = new Date();

  ultimaVentaParaBoleta = { nombreCliente, telefono, items, total, fecha };

  const fechaTexto = fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const horaTexto = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

  const filas = items
    .map(
      (i) => `
      <tr>
        <td>${escaparHTML(i.nombre)}</td>
        <td class="num">${i.cantidad}</td>
        <td class="num">${formatoMoneda(i.precio)}</td>
        <td class="num">${formatoMoneda(i.precio * i.cantidad)}</td>
      </tr>`
    )
    .join("");

  document.getElementById("receipt-render").innerHTML = `
    <div class="receipt" id="receipt-content">
      <div class="receipt-header">
        <h2>${escaparHTML(NEGOCIO.nombre)}</h2>
        <p>Comprobante de venta</p>
      </div>
      <hr class="receipt-divider" />
      <div class="receipt-meta"><span>Cliente</span><span>${escaparHTML(nombreCliente)}</span></div>
      <div class="receipt-meta"><span>Fecha</span><span>${fechaTexto} · ${horaTexto}</span></div>
      <table class="receipt-table">
        <thead>
          <tr><th>Producto</th><th style="text-align:right">Cant.</th><th style="text-align:right">P. Unit.</th><th style="text-align:right">Total</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      <div class="receipt-total"><span>Total a pagar</span><span>${formatoMoneda(total)}</span></div>
      <div class="receipt-footer">¡Gracias por su compra! · ${escaparHTML(NEGOCIO.nombre)}</div>
    </div>`;

  // Vista previa dentro del modal (misma boleta, visible al usuario)
  document.getElementById("receipt-preview").innerHTML = document.getElementById("receipt-render").innerHTML;

  const btnWhatsapp = document.getElementById("btn-whatsapp-boleta");
  btnWhatsapp.classList.toggle("hidden", !telefono);

  RosaAudio.beepConfirmacion();
  abrirModal("modal-boleta");
}

async function descargarBoletaPNG() {
  const nodo = document.getElementById("receipt-content") || document.querySelector("#receipt-render .receipt");
  if (!nodo || typeof html2canvas === "undefined") {
    mostrarToast("No se pudo generar la imagen", "error");
    return;
  }
  try {
    const canvas = await html2canvas(nodo, { backgroundColor: "#ffffff", scale: 2 });
    const link = document.createElement("a");
    const marcaTiempo = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `boleta-${marcaTiempo}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    mostrarToast("Boleta descargada");
  } catch (err) {
    console.error(err);
    mostrarToast("No se pudo descargar la boleta", "error");
  }
}

function enviarBoletaWhatsApp() {
  if (!ultimaVentaParaBoleta || !ultimaVentaParaBoleta.telefono) return;
  const { nombreCliente, telefono, items, total } = ultimaVentaParaBoleta;

  let numero = telefono.replace(/\D/g, "");
  // Si el usuario escribió un número local sin código de país, se lo anteponemos.
  if (numero.length <= 9) numero = NEGOCIO.whatsappCodigoPais + numero;

  const detalle = items.map((i) => `• ${i.nombre} x${i.cantidad} — ${formatoMoneda(i.precio * i.cantidad)}`).join("%0A");

  const mensaje =
    `Hola ${nombreCliente}, aquí tu boleta de *${NEGOCIO.nombre}*:%0A%0A` +
    `${detalle}%0A%0A` +
    `*Total: ${formatoMoneda(total)}*%0A%0A` +
    `¡Gracias por tu compra! 🌿%0A` +
    `(Adjunta la imagen de la boleta que acabas de descargar)`;

  window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
}
