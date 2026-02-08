document.addEventListener('DOMContentLoaded', () => {
  let carrito = cargarCarrito();
  actualizarBadge(carrito);
});

function cargarCarrito() {
  const saved = localStorage.getItem('carritoFenixLaser');
  return saved ? JSON.parse(saved) : [];
}

function agregarAlCarrito(product) {
  let carrito = cargarCarrito();
  
  const existing = carrito.find(item => item.id === product.id);
  
  if (existing) {
    existing.cantidad += 1;
  } else {
    carrito.push({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      img: product.img,
      cantidad: 1
    });
  }
  
  localStorage.setItem('carritoFenixLaser', JSON.stringify(carrito));
  actualizarBadge(carrito);
}

function actualizarBadge(carrito) {
  const badges = document.querySelectorAll('#cart-badge');
  if (badges.length === 0) return;
  
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  
  badges.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'block' : 'none';
  });
}