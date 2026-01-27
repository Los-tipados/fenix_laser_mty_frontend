// load-footer.js
document.addEventListener('DOMContentLoaded', function () {
  const footerContainer = document.getElementById('footer-container');

  if (!footerContainer) {
    console.warn('No se encontró el elemento #footer-container en la página');
    return;
  }

  fetch('footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al cargar footer.html: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(html => {
      footerContainer.innerHTML = html;

      // Opcional: Ejecutar código después de cargar el footer (por ejemplo, inicializar tooltips de Bootstrap si los usas)
      // bootstrap.Tooltip && document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
    })
    .catch(error => {
      console.error('No se pudo cargar el footer:', error);
      footerContainer.innerHTML = `
        <div class="alert alert-danger text-center m-4">
          No se pudo cargar el pie de página. <br>
          <small>Error: ${error.message}</small>
        </div>
      `;
    });
});