// ==============================
// FUNCIÓN PARA CREAR LA CARD
// ==============================
function addProductToList(product) {
  const list = document.getElementById('product-list');

  const col = document.createElement('div');
  col.className = 'col-md-4';

  col.innerHTML = `
    <div class="card-catalogo h-100">
      <img src="${product.img}" class="card-img-top" alt="${product.nombre}">
      <div class="card-body">
        <h5 class="card-title">${product.nombre}</h5>
        <h6 class="card-subtitle mb-2 text-muted">$${product.precio} MXN</h6>
        <p class="card-text">${product.descripcion}</p>
      </div>
    </div>
  `;

  list.appendChild(col);
}

// ==============================
// CARGA DESDE EL JSON
// ==============================
fetch('../activos/data/productos.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(product => addProductToList(product));
  })
  .catch(error => console.error('Error loading JSON:', error));
