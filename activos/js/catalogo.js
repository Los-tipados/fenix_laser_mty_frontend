// ==============================
// ELEMENTOS DEL DOM
// ==============================
const productList       = document.getElementById('product-list');
const recommendedInner  = document.getElementById('recommended-inner');
const searchInput       = document.getElementById('searchInput');
const priceRange        = document.getElementById('priceRange');
const priceValue        = document.getElementById('priceValue');
const categoriasList    = document.getElementById('categoriasList'); // contenedor de checkboxes

const API_BASE = 'http://localhost:8080/api/v1';

let selectedCategories = []; // guarda idCategoria seleccionados
let allProducts        = [];

// ==============================
// UTILIDADES
// ==============================
function getStarsHTML(rating = 0) {
    const fullStars = Math.floor(rating);
    const hasHalf   = rating % 1 >= 0.5;
    let html = '';

    for (let i = 0; i < fullStars; i++) html += '<i class="fas fa-star"></i>';
    if (hasHalf) html += '<i class="fas fa-star-half-alt"></i>';

    const empty = 5 - fullStars - (hasHalf ? 1 : 0);
    for (let i = 0; i < empty; i++) html += '<i class="far fa-star"></i>';

    return html;
}

function getItemsPerSlide() {
    const w = window.innerWidth;
    if (w < 576) return 1;
    if (w < 992) return 2;
    return 3;
}

// ==============================
// CREAR CARD
// ✅ product.img → product.imagen
// ✅ product.categoria → product.categoria?.nombre
// ==============================
function createCard(product, isCatalog = true) {
    const cardHTML = `
        <div class="card h-100 ${isCatalog ? '' : 'card-carousel'}">
            <img src="${product.imagen || ''}" class="card-img-top" alt="${product.nombre}"
                 onerror="this.src='https://via.placeholder.com/300x180?text=Sin+Imagen'">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.nombre}</h5>
                <h6 class="card-subtitle mb-2">
                    $${Number(product.precio || 0).toLocaleString('es-MX')} MXN
                </h6>
                <div class="rating mb-2">
                    ${getStarsHTML(parseFloat(product.rating) || 0)}
                    <small class="text-white-50 ms-1">(${product.rating || 0})</small>
                </div>
                <p class="card-text flex-grow-1">${product.descripcion || ''}</p>
                ${isCatalog
                    ? `<a href="/paginas/modal_detalle.html" class="btn btn-outline-warning mt-auto btn-ver-detalle"
                          data-id="${product.idProducto}">Ver detalle</a>`
                    : ''}
            </div>
        </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.className = isCatalog ? 'col-12 col-sm-6 col-md-6 col-lg-4 mb-4' : '';
    wrapper.dataset.product = JSON.stringify(product);
    wrapper.innerHTML = cardHTML;

    return wrapper;
}

// ==============================
// RENDER CARRUSEL (RECOMENDADOS)
// ==============================
function renderCarousel(products) {
    if (!recommendedInner) return;

    const recommended = products.filter(p => p.visibleRecomendados === true);
    recommendedInner.innerHTML = '';

    if (recommended.length === 0) return;

    const itemsPerSlide = getItemsPerSlide();

    for (let i = 0; i < recommended.length; i += itemsPerSlide) {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${i === 0 ? 'active' : ''}`;

        const row = document.createElement('div');
        row.className = 'row justify-content-center g-4';

        recommended.slice(i, i + itemsPerSlide).forEach(product => {
            const col = document.createElement('div');
            col.className =
                itemsPerSlide === 1 ? 'col-12' :
                itemsPerSlide === 2 ? 'col-12 col-sm-6' :
                                      'col-12 col-sm-6 col-lg-3';
            col.appendChild(createCard(product, false));
            row.appendChild(col);
        });

        carouselItem.appendChild(row);
        recommendedInner.appendChild(carouselItem);
    }
}

// ==============================
// RENDER CATÁLOGO
// ✅ Filtro de categoría usa idCategoria (número) en lugar de string
// ==============================
function renderCatalog(products) {
    if (!productList) return;

    productList.innerHTML = '';

    const maxPrice   = parseInt(priceRange?.value) || 99999;
    const searchText = searchInput?.value.toLowerCase().trim() || '';
    let hasResults   = false;

    products.forEach(product => {

        if (product.visibleCatalogo === false) return;

        const matchesPrice = Number(product.precio) <= maxPrice;

        const matchesSearch =
            !searchText ||
            product.nombre?.toLowerCase().includes(searchText) ||
            product.descripcion?.toLowerCase().includes(searchText);

        // ✅ Comparar con idCategoria del objeto categoria
        const matchesCategory =
            selectedCategories.length === 0 ||
            selectedCategories.includes(String(product.categoria?.idCategoria));

        if (matchesPrice && matchesSearch && matchesCategory) {
            productList.appendChild(createCard(product, true));
            hasResults = true;
        }
    });

    document.getElementById('noResults')?.classList.toggle('d-none', hasResults);
}

// ==============================
// CARGAR CHECKBOXES DE CATEGORÍAS
// ✅ Dinámico desde la BD en lugar de hardcodeado en HTML
// ==============================
async function cargarCategorias() {
    if (!categoriasList) return;

    try {
        const categorias = await fetch(`${API_BASE}/categorias`).then(r => r.json());

        categoriasList.innerHTML = '';

        categorias.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input categoria-check" type="checkbox"
                       value="${cat.idCategoria}" id="cat_${cat.idCategoria}">
                <label class="form-check-label" for="cat_${cat.idCategoria}">
                    ${cat.nombre}
                </label>
            `;
            categoriasList.appendChild(div);
        });

        // Asignar eventos a los checkboxes recién creados
        categoriasList.querySelectorAll('.categoria-check').forEach(cb => {
            cb.addEventListener('change', () => {
                selectedCategories = Array.from(
                    categoriasList.querySelectorAll('.categoria-check:checked')
                ).map(c => c.value);

                renderCatalog(allProducts);
            });
        });

    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// ==============================
// INICIALIZACIÓN — FETCH DESDE LA API
// ✅ Ya no depende del JSON local
// ==============================
async function init() {
    try {
        // Cargar productos y categorías en paralelo
        const [products] = await Promise.all([
            fetch(`${API_BASE}/products`).then(r => {
                if (!r.ok) throw new Error(`Error ${r.status}`);
                return r.json();
            }),
            cargarCategorias()
        ]);

        allProducts = products;

        if (priceRange && priceValue) {
            priceValue.textContent = `$${parseInt(priceRange.value).toLocaleString('es-MX')}`;

            priceRange.addEventListener('input', () => {
                priceValue.textContent = `$${parseInt(priceRange.value).toLocaleString('es-MX')}`;
                renderCatalog(allProducts);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => renderCatalog(allProducts));
        }

        window.addEventListener('resize', () => renderCarousel(allProducts));

        renderCarousel(allProducts);
        renderCatalog(allProducts);

        // ✅ Calcular min y max desde los precios reales de la BD
const precios  = allProducts.map(p => Number(p.precio));
const minPrice = Math.floor(Math.min(...precios) / 100) * 100; // redondear hacia abajo
const maxPrice = Math.ceil(Math.max(...precios)  / 100) * 100; // redondear hacia arriba

priceRange.min   = minPrice;
priceRange.max   = maxPrice;
priceRange.value = maxPrice; // mostrar todos por defecto
priceRange.step  = 100;

// Actualizar etiquetas
document.querySelector('.d-flex.justify-content-between span:first-child').textContent =
    `$${minPrice.toLocaleString('es-MX')}`;

priceValue.textContent = `$${maxPrice.toLocaleString('es-MX')}`;

    } catch (error) {
        console.error('Error al cargar productos:', error);
        if (productList) {
            productList.innerHTML = `
                <div class="col-12 text-center py-5 text-danger">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <p>No se pudieron cargar los productos. Intenta más tarde.</p>
                </div>
            `;
        }
    }
}

// Arrancar
init();
