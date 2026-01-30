// modal_detalle.js - Versión completa con layout HORIZONTAL (imagen izquierda, contenido derecha)

console.log("modal_detalle.js → cargado");

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded OK");

  // Esperamos a que el modal esté cargado vía loadGlobalModal
  window.loadGlobalModal(() => {
    console.log("Modal parcial cargado → inicializando elementos");

    const modalElement = document.getElementById('detalleProductoModal');
    if (!modalElement) {
      console.error("No se encontró #detalleProductoModal en el DOM");
      return;
    }

    const modal = new bootstrap.Modal(modalElement);
    const modalContent = document.getElementById('modalContent');
    const modalLoading = document.getElementById('modalLoading');

    if (!modalContent || !modalLoading) {
      console.error("Faltan elementos #modalContent o #modalLoading");
      return;
    }

    // Función principal para mostrar el detalle del producto
    window.mostrarDetalleProducto = function(product) {
      console.log("mostrarDetalleProducto llamado con:", product.nombre);

      modalLoading.classList.remove('d-none');
      modalContent.innerHTML = '';

      // Pequeño delay para simular carga (puedes reducirlo o quitarlo)
      setTimeout(() => {
        modalLoading.classList.add('d-none');

        modalContent.innerHTML = `
          <div class="product-detail-wrapper px-3 py-4">
            <div class="row align-items-center g-4">
              <!-- Columna izquierda: Imagen -->
              <div class="col-lg-6 text-center text-lg-start">
                <img 
                  src="${product.img}" 
                  alt="${product.nombre}" 
                  class="product-img-main img-fluid"
                >
              </div>
              
              <!-- Columna derecha: Contenido -->
              <div class="col-lg-6">
                <h1 class="poker-title mb-3">${product.nombre.toUpperCase()}</h1>
                
                <div class="price-wrapper mb-4">
                  <span class="old-price">$${Math.round(product.precio * 1.25).toLocaleString('es-MX')} MXN</span>
                  <span class="current-price">$${product.precio.toLocaleString('es-MX')} MXN</span>
                </div>
                <p class="product-description mb-4">
                  ${product.descripcion || 'Descripción no disponible'}
                </p>
                
                <div class="badges-container mb-4">
                  <div class="badge-promo">
                    <img src="https://lh3.googleusercontent.com/u/0/d/1OPZkmtlTN9Pqo6YQyU3H7MtJVswAaNMV" alt="Envíos $250">
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

        // Listener para el botón Añadir al carrito
        const addBtn = modalContent.querySelector('#modalAddToCart');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            console.log("Añadiendo al carrito:", product.nombre, "- Precio:", product.precio);
            // Aquí va tu lógica real de agregar al carrito
            // Ejemplo: agregarAlCarrito(product);
          });
        }

        // Abrimos el modal
        modal.show();
        console.log("Modal abierto con éxito para:", product.nombre);
      }, 300);
    };

    // Listener para los botones "Ver detalle" en la página
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn-ver-detalle');
      if (!btn) return;

      e.preventDefault();
      console.log("Botón Ver detalle clicado");

      const container = btn.closest('[data-product]');
      if (!container || !container.dataset.product) {
        console.error("No se encontró atributo data-product");
        return;
      }

      try {
        const product = JSON.parse(container.dataset.product);
        window.mostrarDetalleProducto(product);
      } catch (err) {
        console.error("Error al parsear producto desde data-product:", err);
      }
    });

    console.log("Inicialización del modal de detalle completada");
  });
});