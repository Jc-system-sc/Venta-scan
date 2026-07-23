# Comercial Rosita — Sistema de inventario y ventas

Sistema web ligero para vender desde el celular: escaneas el código de barras,
se arma la lista de venta y generas una boleta descargable o para enviar por
WhatsApp. El catálogo y los precios se guardan en Firebase (Firestore).

## Estructura del proyecto

```
comercial-rosita/
├── index.html          Estructura de las 3 pantallas (Vender, Catálogo, Precios)
├── README.md            Este archivo
├── css/
│   └── styles.css       Todo el diseño visual (colores, tarjetas, botones)
└── js/
    ├── config.js         ← EDITA ESTE ARCHIVO con tus datos de Firebase
    ├── state.js           Estado compartido (catálogo en memoria, venta activa)
    ├── audio.js            Beeps de escaneo, error y confirmación
    ├── ui.js                Navegación entre pestañas y modales
    ├── catalogo.js          Alta de productos + validación de EAN duplicado
    ├── precios.js           Buscador y editor de precios
    ├── ventas.js             Escáner de cámara + lista de venta
    ├── boleta.js              Generar boleta, descargar PNG, enviar WhatsApp
    └── main.js                 Arranca la app y conecta Firebase
```

Si en el futuro quieres cambiar algo puntual, ya sabes dónde tocar:
- ¿Cambiar colores o el diseño? → `css/styles.css`
- ¿Cambiar el nombre del negocio o moneda? → `js/config.js`
- ¿Cambiar cómo se arma la boleta? → `js/boleta.js`
- ¿Cambiar el comportamiento del escáner? → `js/ventas.js`

## 1. Configura Firebase (obligatorio)

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto.
2. En **Configuración del proyecto → Tus apps**, registra una app Web (ícono `</>`).
3. Copia el objeto `firebaseConfig` que te muestra y pégalo en `js/config.js`.
4. En el menú lateral, entra a **Firestore Database** → **Crear base de datos** (actívala).
5. En la pestaña **Reglas** de Firestore, mientras pruebas puedes usar:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

   ⚠️ Esto deja la base de datos abierta a cualquiera. Es solo para probar
   rápido; antes de usarlo en serio con tu negocio, agrega reglas de
   autenticación (por ejemplo, pedir que el usuario haya iniciado sesión).

## 2. Publícalo con HTTPS (obligatorio para la cámara)

Los navegadores solo permiten usar la cámara desde `https://` o desde
`http://localhost`. La forma más simple y gratis:

**Opción A — GitHub Pages**
1. Sube esta carpeta a un repositorio de GitHub.
2. Ve a **Settings → Pages**, elige la rama principal como fuente.
3. En un par de minutos tendrás una URL `https://tuusuario.github.io/tu-repo/`.

**Opción B — Netlify / Vercel**
Arrastra la carpeta al panel de Netlify (netlify.com/drop) y listo, te da una
URL con HTTPS al instante.

## 3. Usa el sistema

1. Abre la URL publicada desde el celular.
2. Pestaña **Catálogo**: registra tus productos con su código EAN, nombre
   (marca + peso/medida) y precio.
3. Pestaña **Vender**: toca "Iniciar escáner" y apunta la cámara al código
   de barras. Si un producto no tiene código legible, búscalo por nombre en
   el campo de búsqueda manual.
4. Cuando termines, toca "Confirmar venta", ingresa el nombre del cliente
   (y opcionalmente su celular) y se genera la boleta lista para descargar
   o enviar por WhatsApp.
5. Pestaña **Precios**: busca cualquier producto y actualiza su precio al
   instante.

## Notas importantes

- **WhatsApp:** por seguridad, los navegadores no permiten adjuntar una
  imagen automáticamente a un chat de WhatsApp. El botón "Enviar por
  WhatsApp" abre el chat con el resumen de la compra en texto; la imagen de
  la boleta debes adjuntarla tú manualmente (ya la habrás descargado con el
  botón "Descargar PNG").
- **Sin internet:** si Firebase no está configurado o no hay conexión, el
  punto junto al nombre del negocio se pone en rojo y verás un aviso.
- **Probar en tu computadora:** puedes abrir `index.html` con una extensión
  tipo "Live Server" de VS Code para ver el diseño, pero la cámara solo
  funcionará si accedes por `localhost` o por una URL con HTTPS.
