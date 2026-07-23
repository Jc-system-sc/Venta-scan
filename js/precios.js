/* ==========================================================================
   PRECIOS.JS
   Buscar un producto por nombre o EAN y actualizar su precio al instante.
   ========================================================================== */

function initPrecios() {
  const input = document.getElementById("buscar-precio");
  input.addEventListener("input", () => renderListaPrecios(input.value));
}

function renderListaPrecios(query) {
  const cont = document.getElementById("lista-precios");
  const lista = query.trim()
    ? buscarProductos(query)
    : [...RosaState.productos].sort((a, b) => a.nombre.localeCompare(b.nombre));

  if (lista.length === 0) {
    cont.innerHTML = `
      <div class="empty-state">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <div>${
          query.trim() ? "No se encontraron productos." : "Tu catálogo está vacío por ahora."
        }</div>
      </div>`;
    return;
  }

  cont.innerHTML = lista
    .map(
      (p) => `
      <div class="list-row" data-id="${p.id}">
        <div class="list-info">
          <div class="list-name">${escaparHTML(p.nombre)}</div>
          <div class="list-meta">EAN ${escaparHTML(p.ean)}</div>
        </div>
        <div class="price-edit">
          <input type="number" step="0.01" min="0" value="${p.precio.toFixed(2)}" data-original="${p.precio.toFixed(2)}" class="input-precio-item" />
          <button class="save-price-btn" data-id="${p.id}" title="Guardar precio">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
        </div>
      </div>`
    )
    .join("");

  // Marca el botón de guardar como "activo" solo cuando el valor cambió
  cont.querySelectorAll(".input-precio-item").forEach((inp) => {
    inp.addEventListener("input", () => {
      const fila = inp.closest(".list-row");
      const btn = fila.querySelector(".save-price-btn");
      btn.classList.toggle("dirty", inp.value !== inp.dataset.original);
    });
  });

  cont.querySelectorAll(".save-price-btn").forEach((btn) => {
    btn.addEventListener("click", () => guardarPrecio(btn));
  });
}

async function guardarPrecio(btn) {
  const id = btn.dataset.id;
  const fila = btn.closest(".list-row");
  const input = fila.querySelector(".input-precio-item");
  const nuevoPrecio = parseFloat(input.value);

  if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
    mostrarToast("Ingresa un precio válido", "error");
    return;
  }
  if (!RosaState.firebaseListo) {
    mostrarToast("Firebase no está conectado todavía", "error");
    return;
  }

  btn.disabled = true;
  try {
    await RosaState.db.collection("productos").doc(id).update({ precio: nuevoPrecio });
    input.dataset.original = nuevoPrecio.toFixed(2);
    btn.classList.remove("dirty");
    mostrarToast("Precio actualizado");
  } catch (err) {
    console.error(err);
    mostrarToast("No se pudo actualizar el precio", "error");
  } finally {
    btn.disabled = false;
  }
}
