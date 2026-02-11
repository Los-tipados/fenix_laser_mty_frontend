   window.loadGlobalModal = function(callback) {
          if (typeof callback === 'function') callback();
      }

// modal_galeria.js - Versión INFORMATIVA (Sin botones y sin precios)
console.log("modal_galeria.js → cargado (Versión Limpia)");

document.addEventListener('DOMContentLoaded', () => {
  window.loadGlobalModal(() => {
    const modalElement = document.getElementById('detalleProductoModal');
    if (!modalElement) return;

    const modal = new bootstrap.Modal(modalElement);
    const modalContent = document.getElementById('modalContent');
    const modalLoading = document.getElementById('modalLoading');

    window.mostrarDetalleGaleria = function(product) {
      modalLoading.classList.remove('d-none');
      modalContent.innerHTML = '';

      setTimeout(() => {
        modalLoading.classList.add('d-none');

        modalContent.innerHTML = `
          <div class="product-detail-wrapper px-3 py-4">
            <div class="row align-items-center g-4">
              <div class="col-lg-6 text-center">
                <img src="${product.img}" alt="${product.nombre}" class="product-img-main img-fluid">
              </div>
              
              <div class="col-lg-6">
                <h1 class="poker-title mb-3">${product.nombre.toUpperCase()}</h1>
                
                <p class="product-description mb-4">
                  ${product.descripcion || 'Descripción no disponible'}
                </p>
                
                <div class="badges-container">
                  <div class="badge-promo"><img src="https://lh3.googleusercontent.com/u/0/d/1OPZkmtlTN9Pqo6YQyU3H7MtJVswAaNMV" alt="Envíos"></div>
                  <div class="badge-promo"><img src="https://lh3.googleusercontent.com/u/0/d/1CJalKdsJKGFan4UWgaF5d4Pgynf8y5MS" alt="Grabado"></div>
                  <div class="badge-promo"><img src="https://lh3.googleusercontent.com/u/0/d/1LPp8G3PkhAmC5iWsqJwWG9kdOdRyiTMr" alt="Seguridad"></div>
                </div>
              </div>
            </div>
          </div>
        `;

        modal.show();
      }, 300);
    };

    // Listener de clics para abrir el modal
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn-ver-detalle');
      if (!btn) return;
      const container = btn.closest('[data-product]');
      if (container) {
        try {
          const product = JSON.parse(container.dataset.product);
          window.mostrarDetalleGaleria(product);
        } catch (err) { console.error("Error JSON:", err); }
      }
    });
  });
});