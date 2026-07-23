/* ==========================================================================
   MAIN.JS
   Arranca la app: conecta Firebase, sincroniza el catálogo y activa
   la interfaz. Se ejecuta al final, cuando el HTML ya está cargado.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Rellenamos el nombre del negocio en el encabezado y el avatar
  document.getElementById("brand-name").textContent = NEGOCIO.nombre;
  document.getElementById("brand-avatar").textContent = NEGOCIO.inicial;
  document.title = NEGOCIO.nombre;

  initUI();
  initCatalogo();
  initPrecios();
  initVentas();
  initBoleta();

  conectarFirebase();
});

function conectarFirebase() {
  const configSinCompletar =
    !firebaseConfig.apiKey || firebaseConfig.apiKey === "TU_API_KEY" || !firebaseConfig.projectId;

  if (configSinCompletar) {
    actualizarEstadoConexion(false);
    mostrarToast("Falta configurar Firebase. Abre js/config.js", "error");
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    RosaState.db = firebase.firestore();

    RosaState.db.collection("productos").onSnapshot(
      (snapshot) => {
        RosaState.productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        RosaState.firebaseListo = true;
        actualizarEstadoConexion(true);
        renderRecientesCatalogo();
        renderListaPrecios(document.getElementById("buscar-precio").value);
      },
      (err) => {
        console.error(err);
        RosaState.firebaseListo = false;
        actualizarEstadoConexion(false);
        mostrarToast("Error al leer el catálogo desde Firebase", "error");
      }
    );
  } catch (err) {
    console.error(err);
    actualizarEstadoConexion(false);
    mostrarToast("No se pudo inicializar Firebase. Revisa config.js", "error");
  }
}
