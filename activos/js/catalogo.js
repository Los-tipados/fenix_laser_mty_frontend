// Elementos del DOM
const productList = document.getElementById('product-list');
const recommendedInner = document.getElementById('recommended-inner');
const searchInput = document.getElementById('searchInput');
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');

// Array para categorías seleccionadas
let selectedCategories = [];

// -------------------------------
// Tarjeta para CARRUSEL (recomendados) - sin clases de columna
// -------------------------------
function createRecommendedCard(product) {
  const rating = product.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let starsHTML = '';
  
  for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
  if (hasHalf) starsHTML += '<i class="fas fa-star-half-alt"></i>';
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';

  const wrapper = document.createElement('div');
  wrapper.className = 'recommended-card-wrapper'; // para estilos específicos si quieres

  wrapper.innerHTML = `
    <div class="card h-100">
      <img src="${product.img}" class="card-img-top" alt="${product.nombre}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.nombre}</h5>
        <h6 class="card-subtitle mb-2">
          $${product.precio.toLocaleString('es-MX')} MXN
        </h6>
        <div class="rating mb-2">
          ${starsHTML}
          <small class="text-muted ms-1">(${rating})</small>
        </div>
        <p class="card-text flex-grow-1">
          ${product.descripcion}
        </p>
      </div>
    </div>
  `;

  return wrapper;
}

// -------------------------------
// Tarjeta para CATÁLOGO NORMAL (grid) - con clases Bootstrap
// -------------------------------
function createCatalogCard(product) {
  const rating = product.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let starsHTML = '';
  
  for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
  if (hasHalf) starsHTML += '<i class="fas fa-star-half-alt"></i>';
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';

  const col = document.createElement('div');
  col.className = 'col-6 col-md-4 col-lg-3'; // ← aquí están las columnas responsivas

  col.innerHTML = `
    <div class="card h-100">
      <img src="${product.img}" class="card-img-top" alt="${product.nombre}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.nombre}</h5>
        <h6 class="card-subtitle mb-2">
          $${product.precio.toLocaleString('es-MX')} MXN
        </h6>
        <div class="rating mb-2">
          ${starsHTML}
          <small class="text-muted ms-1">(${rating})</small>
        </div>
        <p class="card-text flex-grow-1">
          ${product.descripcion}
        </p>
        <a href="#" class="btn btn-outline-warning mt-auto">Ver detalle</a>
      </div>
    </div>
  `;

  // Datos para filtrado (solo necesarios en el catálogo completo)
  col.dataset.precio = product.precio;
  col.dataset.nombre = product.nombre.toLowerCase();
  col.dataset.descripcion = product.descripcion.toLowerCase();
  col.dataset.categoria = product.categoria || '';

  return col;
}

// -------------------------------
// Render principal
// -------------------------------
function renderProducts(products) {
  // Limpiar todo
  if (productList) productList.innerHTML = '';
  if (recommendedInner) recommendedInner.innerHTML = '';

  // 1. Recomendados → carrusel
  const recommended = products.filter(p => p.recomendado === true);

  if (recommended.length > 0 && recommendedInner) {
    const carouselItem = document.createElement('div');
    carouselItem.className = 'carousel-item active';

    recommended.forEach(product => {
      const cardWrapper = createRecommendedCard(product);
      carouselItem.appendChild(cardWrapper);
    });

    recommendedInner.appendChild(carouselItem);
  }

  // 2. Catálogo completo → grid con filtros
  const maxPrice = parseInt(priceRange.value) || 3000;
  const searchText = searchInput.value.toLowerCase().trim();

  let hasResults = false;

  products.forEach(product => {
    const matchesPrice = product.precio <= maxPrice;
    const matchesSearch = !searchText || 
      product.nombre.toLowerCase().includes(searchText) ||
      product.descripcion.toLowerCase().includes(searchText);
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(product.categoria);

    if (matchesPrice && matchesSearch && matchesCategory) {
      productList.appendChild(createCatalogCard(product));
      hasResults = true;
    }
  });

  // Mensaje no resultados
  const noResults = document.getElementById('noResults');
  if (noResults) {
    noResults.classList.toggle('d-none', hasResults);
  }
}

// -------------------------------
// Carga de datos + eventos
// -------------------------------
fetch('../activos/data/productos.json')
  .then(response => {
    if (!response.ok) throw new Error('Error al cargar JSON');
    return response.json();
  })
  .then(products => {
    priceValue.textContent = `$${priceRange.value.toLocaleString('es-MX')}`;

    renderProducts(products);

    priceRange.addEventListener('input', () => {
      priceValue.textContent = `$${priceRange.value.toLocaleString('es-MX')}`;
      renderProducts(products);
    });

    searchInput.addEventListener('input', () => renderProducts(products));

    document.querySelectorAll('.form-check-input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        selectedCategories = Array.from(
          document.querySelectorAll('.form-check-input[type="checkbox"]:checked')
        ).map(cb => cb.value);
        renderProducts(products);
      });
    });
  })
  .catch(error => {
    console.error('Error al cargar productos:', error);
    if (productList) {
      productList.innerHTML = '<p class="text-danger text-center my-5">No se pudieron cargar los productos. Intenta más tarde.</p>';
    }
  });