// ==============================
// ELEMENTOS DEL DOM
// ==============================
const productList = document.getElementById("product-list");
const recommendedInner = document.getElementById("recommended-inner");
const searchInput = document.getElementById("searchInput");
const priceRange = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");

let selectedCategories = [];
let allProducts = [];

// ==============================
// UTILIDADES
// ==============================
function getStarsHTML(rating = 0) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = "";

  for (let i = 0; i < fullStars; i++) html += '<i class="fas fa-star"></i>';
  if (hasHalf) html += '<i class="fas fa-star-half-alt"></i>';

  const empty = 5 - fullStars - (hasHalf ? 1 : 0);
  for (let i = 0; i < empty; i++) html += '<i class="far fa-star"></i>';

  return html;
}

function getItemsPerSlide() {
  const w = window.innerWidth;
  if (w < 576) return 1; // móvil
  if (w < 992) return 2; // tablet
  return 3; // desktop
}

// ==============================
// CREAR CARD
// ==============================
function createCard(product, isCatalog = true) {
  const cardHTML = `
        <div class="card h-100">
            <img src="${product.img}" class="card-img-top" alt="${product.nombre}">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.nombre}</h5>
                <h6 class="card-subtitle mb-2">
                    $${product.precio.toLocaleString("es-MX")} MXN
                </h6>
                <div class="rating mb-2">
                    ${getStarsHTML(product.rating || 0)}
                    <small class="text-white-50 ms-1">(${product.rating || 0})</small>
                </div>
                <p class="card-text flex-grow-1">${product.descripcion}</p>
                ${isCatalog ? '<a href="#" class="btn btn-outline-warning mt-auto">Ver detalle</a>' : ""}
            </div>
        </div>
    `;

  const wrapper = document.createElement("div");
  wrapper.className = isCatalog ? "col-12 col-sm-6 col-md-6 col-lg-4 mb-4" : "";
  wrapper.innerHTML = cardHTML;

  return wrapper;
}

// ==============================
// RENDER CARRUSEL (RECOMENDADOS)
// ==============================
function renderCarousel(products) {
  if (!recommendedInner) return;

  // 🔥 SOLO RECOMENDADOS VISIBLES
  const recommended = products.filter((p) => p.visibleRecomendados === true);

  recommendedInner.innerHTML = "";

  const itemsPerSlide = getItemsPerSlide();

  for (let i = 0; i < recommended.length; i += itemsPerSlide) {
    const carouselItem = document.createElement("div");
    carouselItem.className = `carousel-item ${i === 0 ? "active" : ""}`;

    const row = document.createElement("div");
    row.className = "row justify-content-center g-4";

    recommended.slice(i, i + itemsPerSlide).forEach((product) => {
      const col = document.createElement("div");

      col.className =
        itemsPerSlide === 1
          ? "col-12"
          : itemsPerSlide === 2
            ? "col-12 col-md-6"
            : "col-12 col-md-6 col-lg-4";

      col.appendChild(createCard(product, false));
      row.appendChild(col);
    });

    carouselItem.appendChild(row);
    recommendedInner.appendChild(carouselItem);
  }
}

// ==============================
// RENDER CATÁLOGO
// ==============================
function renderCatalog(products) {
  if (!productList) return;

  productList.innerHTML = "";

  const maxPrice = parseInt(priceRange.value) || 5000;
  const searchText = searchInput.value.toLowerCase().trim();
  let hasResults = false;

  products.forEach((product) => {
    // ⛔ SOLO CATÁLOGO
    if (product.visibleCatalogo === false) return;

    const matchesPrice = product.precio <= maxPrice;

    const matchesSearch =
      !searchText ||
      product.nombre.toLowerCase().includes(searchText) ||
      product.descripcion.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.categoria);

    if (matchesPrice && matchesSearch && matchesCategory) {
      productList.appendChild(createCard(product, true));
      hasResults = true;
    }
  });

  document.getElementById("noResults").classList.toggle("d-none", hasResults);
}

// ==============================
// FETCH + EVENTOS
// ==============================
fetch("../activos/data/productos.json")
  .then((res) => res.json())
  .then((products) => {
    allProducts = products;

    priceValue.textContent = `$${parseInt(priceRange.value).toLocaleString("es-MX")}`;

    renderCarousel(allProducts);
    renderCatalog(allProducts);

    priceRange.addEventListener("input", () => {
      priceValue.textContent = `$${parseInt(priceRange.value).toLocaleString("es-MX")}`;
      renderCatalog(allProducts);
    });

    searchInput.addEventListener("input", () => {
      renderCatalog(allProducts);
    });

    document.querySelectorAll(".form-check-input").forEach((cb) => {
      cb.addEventListener("change", () => {
        selectedCategories = Array.from(
          document.querySelectorAll(".form-check-input:checked"),
        ).map((c) => c.value);

        renderCatalog(allProducts);
      });
    });

    // 🔥 Re-render carrusel al cambiar tamaño
    window.addEventListener("resize", () => {
      renderCarousel(allProducts);
    });
  });
