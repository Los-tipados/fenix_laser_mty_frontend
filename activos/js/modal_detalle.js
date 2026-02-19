// modal_detalle.js

document.addEventListener('DOMContentLoaded', () => {

  window.loadGlobalModal(() => {

    const modalElement = document.getElementById('detalleProductoModal');
    if (!modalElement) {
      console.error("No se encontró #detalleProductoModal en el DOM");
      return;
    }

    const modal        = new bootstrap.Modal(modalElement);
    const modalContent = document.getElementById('modalContent');
    const modalLoading = document.getElementById('modalLoading');

    if (!modalContent || !modalLoading) {
      console.error("Faltan elementos #modalContent o #modalLoading");
      return;
    }

    // ==============================
    // MOSTRAR DETALLE DEL PRODUCTO
    // ==============================
    window.mostrarDetalleProducto = function (product) {

      modalLoading.classList.remove('d-none');
      modalContent.innerHTML = '';

      setTimeout(() => {
        modalLoading.classList.add('d-none');

        // ✅ product.img → product.imagen
        // ✅ parseFloat(product.precio) para manejar BigDecimal del backend
        const precio    = parseFloat(product.precio);
        const precioOld = Math.round(precio * 1.25);

        modalContent.innerHTML = `
          <div class="product-detail-wrapper px-3 py-4">
            <div class="row align-items-center g-4">

              <!-- Imagen -->
              <div class="col-lg-6 text-center text-lg-start">
                <img
                  src="${product.imagen || ''}"
                  alt="${product.nombre}"
                  class="product-img-main img-fluid"
                  onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'"
                >
              </div>

              <!-- Contenido -->
              <div class="col-lg-6">
                <h1 class="poker-title mb-3">${product.nombre.toUpperCase()}</h1>

                <div class="price-wrapper mb-4">
                  <span class="old-price">$${precioOld.toLocaleString('es-MX')} MXN</span>
                  <span class="current-price">$${precio.toLocaleString('es-MX')} MXN 🔥</span>
                </div>

                <p class="product-description mb-4">
                  ${product.descripcion || 'Descripción no disponible'}
                </p>

                <div class="badges-container mb-4">
                  <div class="badge-promo">
                    <img src="https://lh3.googleusercontent.com/u/0/d/1OPZkmtlTN9Pqo6YQyU3H7MtJVswAaNMV" alt="Envíos">
                  </div>
                  <div class="badge-promo">
                    <img src="https://lh3.googleusercontent.com/u/0/d/1CJalKdsJKGFan4UWgaF5d4Pgynf8y5MS" alt="Grabado GRATIS">
                  </div>
                  <div class="badge-promo">
                    <img src="https://lh3.googleusercontent.com/u/0/d/1LPp8G3PkhAmC5iWsqJwWG9kdOdRyiTMr" alt="Pagos SEGUROS">
                  </div>
                </div>

                <div class="buttons-container">
                  <button class="btn btn-add-cart me-3" id="modalAddToCart">
                    AÑADIR AL CARRITO
                  </button>
                  <a href="/paginas/editor.html">
                    <button class="btn btn-personalizar">
                      PERSONALIZAR AHORA
                    </button>
                  </a>
                </div>
              </div>

            </div>
          </div>
        `;

        // Botón añadir al carrito
        const addBtn = modalContent.querySelector('#modalAddToCart');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            agregarAlCarrito(product);
            Swal.fire({
              icon: 'success',
              title: '¡Añadido!',
              text: 'Se ha añadido al carrito de compras',
              timer: 1500,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
            modal.hide();
          });
        }

        modal.show();
      }, 300);
    };

    // ==============================
    // LISTENER — BOTÓN "VER DETALLE"
    // ==============================
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-ver-detalle');
      if (!btn) return;

      e.preventDefault();

      const container = btn.closest('[data-product]');
      if (!container || !container.dataset.product) {
        console.error("No se encontró atributo data-product");
        return;
      }

      try {
        const product = JSON.parse(container.dataset.product);
        window.mostrarDetalleProducto(product);
      } catch (err) {
        console.error("Error al parsear producto:", err);
      }
    });

  });
});