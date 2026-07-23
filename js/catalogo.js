/* ==========================================================================
   CATALOGO.JS
   Formulario de registro de nuevos productos (Código EAN, nombre, precio)
   con validación de duplicados antes de guardar en Firestore.
   ========================================================================== */

function initCatalogo() {
  const form = document.getElementById("form-producto");
  const inputEAN = document.getElementById("input-ean");
  const inputNombre = document.getElementById("input-nombre");
  const inputPrecio = document.getElementById("input-precio");
  const errorEAN = document.getElementById("error-ean");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEAN.style.display = "none";

    const ean = inputEAN.value.trim();
    const nombre = inputNombre.value.trim();
    const precio = parseFloat(inputPrecio.value);

    if (!ean || !nombre || isNaN(precio) || precio < 0) {
      mostrarToast("Completa todos los campos correctamente", "error");
      return;
    }

    if (!RosaState.firebaseListo) {
      mostrarToast("Firebase no está conectado todavía", "error");
      return;
    }

    // Validación de duplicados contra la caché local (sincronizada en tiempo real)
    const yaExiste = buscarProductoPorEAN(ean);
    if (yaExiste) {
      errorEAN.textContent = `Ya existe: "${yaExiste.nombre}" con este código EAN.`;
      errorEAN.style.display = "block";
      mostrarToast("Ese código EAN ya está registrado", "error");
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await RosaState.db.collection("productos").add({
        ean,
        nombre,
        precio,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
      });
      mostrarToast(`"${nombre}" agregado al catálogo`);
      form.reset();
      inputEAN.focus();
    } catch (err) {
      console.error(err);
      mostrarToast("No se pudo guardar. Revisa tu conexión.", "error");
    } finally {
      btn.disabled = false;
    }
  });

  // Limpia el mensaje de error apenas el usuario vuelve a escribir
  inputEAN.addEventListener("input", () => (errorEAN.style.display = "none"));
}

/** Lista los últimos productos agregados dentro de la pestaña Catálogo */
function renderRecientesCatalogo() {
  const cont = document.getElementById("lista-recientes");
  const recientes = [...RosaState.productos].slice(-6).reverse();

  if (recientes.length === 0) {
    cont.innerHTML = `
      <div class="empty-state">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 7 12 3 4 7v10l8 4 8-4V7Z"/><path d="M4 7l8 4 8-4M12 11v10"/></svg>
        <div>Todavía no registraste productos.</div>
      </div>`;
    return;
  }

  cont.innerHTML = recientes
    .map(
      (p) => `
      <div class="list-row">
        <div class="list-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 7 12 3 4 7v10l8 4 8-4V7Z"/><path d="M4 7l8 4 8-4M12 11v10"/></svg>
        </div>
        <div class="list-info">
          <div class="list-name">${escaparHTML(p.nombre)}</div>
          <div class="list-meta">EAN ${escaparHTML(p.ean)}</div>
        </div>
        <div class="pill pill-green">${formatoMoneda(p.precio)}</div>
      </div>`
    )
    .join("");
}

function escaparHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
