// carga_modal.js (versión corregida y con más depuración)

let isModalLoaded = false;

function loadGlobalModal(callback) {
  if (isModalLoaded) {
    if (callback) callback();
    return;
  }

  console.log("Iniciando carga del modal...");

  fetch('/paginas/modal_detalle.html')   // ← ruta absoluta desde raíz
    .then(response => {
      console.log("Respuesta del fetch:", response.status, response.ok);
      if (!response.ok) {
        throw new Error(`Error al cargar modal: ${response.status} - ${response.statusText}`);
      }
      return response.text();
    })
    .then(html => {
      console.log("HTML del modal recibido (longitud):", html.length);

      const container = document.getElementById('globalModalContainer');
      if (!container) {
        console.error("No se encontró el elemento #globalModalContainer en la página");
        return;
      }

      container.innerHTML = html;
      console.log("Modal insertado en #globalModalContainer");

      // Cargar CSS
      if (!document.querySelector('link[href="/activos/css/modal_detalle.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/activos/css/modal_detalle.css';
        document.head.appendChild(link);
        console.log("CSS modal_detalle.css cargado dinámicamente");
      }

      isModalLoaded = true;
      if (callback) callback();
    })
    .catch(err => {
      console.error("Error durante la carga del modal:", err);
    });
}

window.loadGlobalModal = loadGlobalModal;

// Opcional: carga automática al inicio (puedes comentarlo si lo llamas manualmente)
loadGlobalModal(() => {
  console.log("Carga del modal completada");
});