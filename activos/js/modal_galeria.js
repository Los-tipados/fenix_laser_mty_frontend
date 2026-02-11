// modal_galeria.js - Versión con Botón de Carrito pero SIN PRECIOS
console.log("modal_galeria.js → cargado (Versión con Carrito)");

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
                
                <div class="badges-container mb-4">
                  <div class="badge-promo"><img src="https://lh3.googleusercontent.com/u/0/d/1OPZkmtlTN9Pqo6YQyU3H7MtJVswAaNMV" alt="Envíos"></div>
                  <div class="badge-promo"><img src="https://lh3.googleusercontent.com/u/0/d/1CJalKdsJKGFan4UWgaF5d4Pgynf8y5MS" alt="Grabado"></div>
                  <div class="badge-promo"><img src="https://lh3.googleusercontent.com/u/0/d/1LPp8G3PkhAmC5iWsqJwWG9kdOdRyiTMr" alt="Seguridad"></div>
                </div>
                
                <div class="buttons-container d-flex flex-column flex-md-row gap-2">
                  <button class="btn btn-add-cart flex-fill" id="modalAddToCart">
                    AÑADIR AL CARRITO
                  </button>
                  
                  <a href="/paginas/editor.html" class="flex-fill">
                    <button class="btn btn-personalizar w-100">
                      PERSONALIZAR AHORA
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;

        // Listener para el carrito
        const addBtn = modalContent.querySelector('#modalAddToCart');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            console.log("Añadido al carrito desde Galería:", product.nombre);
            // Si tu sistema de carrito necesita un precio base aunque no se vea:
            // agregarAlCarrito(product); 
          });
        }

        modal.show();
      }, 300);
    };

    // Listener de clics
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