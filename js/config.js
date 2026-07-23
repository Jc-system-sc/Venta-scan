/* ==========================================================================
   CONFIG.JS
   -----------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas editar para conectar tu propia
   base de datos de Firebase.

   Cómo conseguir estos datos (5 minutos):
   1. Entra a https://console.firebase.google.com
   2. Crea un proyecto nuevo (o usa uno existente).
   3. Dentro del proyecto: ⚙️ Configuración del proyecto > "Tus apps" >
      ícono </> (Web) > registra la app.
   4. Firebase te mostrará un bloque "firebaseConfig" — copia esos valores
      aquí abajo, reemplazando los que dicen "TU_...".
   5. En el menú lateral entra a "Firestore Database" > "Crear base de
      datos" (modo producción o de prueba, cualquiera funciona para
      empezar) y actívala.
   6. En "Reglas" de Firestore, mientras pruebas puedes usar algo simple
      como lo de abajo (¡cámbialo antes de lanzar el negocio en serio!):

        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if true;
            }
          }
        }
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCQDPDDeB_B7z03D77bLgvLYeiEjwQw35M",
  authDomain: "comercial-rosita.firebaseapp.com",
  projectId: "comercial-rosita",
  storageBucket: "comercial-rosita.firebasestorage.app",
  messagingSenderId: "560900251167",
  appId: "1:560900251167:web:05d7d40c5b0d882ef43f2a"
};

/* Nombre del negocio que aparece en el encabezado y en la boleta.
   Puedes cambiarlo aquí sin tocar el resto del código. */
const NEGOCIO = {
  nombre: "Comercial Rosita",
  inicial: "R",
  moneda: "S/", // símbolo de moneda usado en toda la app
  whatsappCodigoPais: "51" // Perú. Cámbialo si vendes desde otro país.
};
