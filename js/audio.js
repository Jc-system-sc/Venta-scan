/* ==========================================================================
   AUDIO.JS
   Genera pequeños "beeps" con la Web Audio API (no requiere archivos .mp3).
   ========================================================================== */

const RosaAudio = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
    }
    // Los navegadores móviles suspenden el audio hasta la primera
    // interacción del usuario; nos aseguramos de reanudarlo.
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone({ freq = 880, duration = 0.09, type = "sine", volume = 0.18, delay = 0 }) {
    try {
      const audioCtx = getCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const start = audioCtx.currentTime + delay;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch (e) {
      // Si el navegador bloquea audio, fallamos en silencio.
      console.warn("Audio no disponible:", e);
    }
  }

  return {
    /** Beep corto y agudo al leer un código de barras con éxito */
    beepEscaneo() {
      tone({ freq: 1200, duration: 0.07, type: "sine", volume: 0.2 });
    },
    /** Doble tono grave cuando el código escaneado no existe en el catálogo */
    beepNoEncontrado() {
      tone({ freq: 320, duration: 0.12, type: "square", volume: 0.15 });
      tone({ freq: 250, duration: 0.14, type: "square", volume: 0.15, delay: 0.13 });
    },
    /** Melodía de confirmación al generar la boleta */
    beepConfirmacion() {
      tone({ freq: 880, duration: 0.09, volume: 0.2 });
      tone({ freq: 1175, duration: 0.14, volume: 0.2, delay: 0.1 });
    }
  };
})();
