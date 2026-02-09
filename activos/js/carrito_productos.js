// /activos/js/carrito_productos.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Carrito JS cargado");
    const carrito = cargarCarrito();
    actualizarBadge(carrito);

    // Detectar si estamos en la página del carrito para renderizar
    if (document.getElementById('carrito-items')) {
        renderizarCarrito();
    }

    // Configuración del botón vaciar carrito (si existe en el DOM)
    const btnVaciar = document.getElementById('vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', vaciarCarrito);
    }
});

// --- FUNCIONES DE PERSISTENCIA (LOCAL STORAGE) ---

function cargarCarrito() {
    const saved = localStorage.getItem('carritoFenixLaser');
    return saved ? JSON.parse(saved) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem('carritoFenixLaser', JSON.stringify(carrito));
}

// --- LÓGICA DE NEGOCIO (PRODUCTOS) ---

function agregarAlCarrito(product) {
    let carrito = cargarCarrito();
    
    // Usamos == para evitar problemas si un ID es String y el otro Number
    const existing = carrito.find(item => item.id == product.id);

    if (existing) {
        existing.cantidad += 1;
    } else {
        carrito.push({
            id: product.id,
            nombre: product.nombre,
            precio: parseFloat(product.precio), 
            img: product.img,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    actualizarBadge(carrito);
    console.log("Producto agregado:", product.nombre);
}

function cambiarCantidad(id, cambio) {
    let carrito = cargarCarrito();
    const producto = carrito.find(item => item.id == id);

    if (producto) {
        producto.cantidad += cambio;
        
        // Si la cantidad es menor a 1, lo eliminamos
        if (producto.cantidad <= 0) {
            eliminarDelCarrito(id);
            return;
        }
        
        guardarCarrito(carrito);
        renderizarCarrito();
        actualizarBadge(carrito);
    }
}

function eliminarDelCarrito(id) {
    let carrito = cargarCarrito();
    carrito = carrito.filter(item => item.id != id);
    guardarCarrito(carrito);
    renderizarCarrito();
    actualizarBadge(carrito);
}

function vaciarCarrito() {
    // Usamos SweetAlert2 ya que vi que lo tienes en tu modal
    Swal.fire({
        title: '¿Vaciar carrito?',
        text: "Se eliminarán todos los productos seleccionados",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#cc3333',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('carritoFenixLaser');
            renderizarCarrito();
            actualizarBadge([]);
        }
    });
}

// --- LÓGICA DE INTERFAZ (UI) ---

function actualizarBadge(carrito) {
    const badges = document.querySelectorAll('#cart-badge');
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    badges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-items');
    const totalFinalElemento = document.getElementById('cart-total');
    // Este suele ser el span en el resumen lateral para el subtotal
    const resumenArticulos = document.querySelector('.columna-resumen .divisores-div span:last-child');
    
    const carrito = cargarCarrito();

    // Mantener la estructura del encabezado
    contenedor.innerHTML = `
        <div class="d-flex align-items-center mb-4">
            <a href="/paginas/catalogo.html" class="regresar" style="text-decoration:none; color: #cc3333; font-weight: bold;">← Regresar al catálogo</a>
            <h4 class="texto-carrito ms-4 mb-0">Carrito de Compras</h4>
        </div>
        <hr>
    `;

    if (carrito.length === 0) {
        contenedor.innerHTML += `
            <div class="text-center my-5 py-5">
                <i class="bi bi-cart-x text-muted" style="font-size: 5rem;"></i>
                <h5 class="mt-3 text-muted">Tu carrito está vacío</h5>
                <a href="/paginas/catalogo.html" class="btn btn-outline-danger mt-3">Ir a comprar</a>
            </div>`;
        if (totalFinalElemento) totalFinalElemento.textContent = "$0.00";
        if (resumenArticulos) resumenArticulos.textContent = "$0.00";
        return;
    }

    let totalAcumulado = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalAcumulado += subtotal;

        const row = document.createElement('div');
        row.className = "row mb-4 d-flex justify-content-between align-items-center border-bottom pb-3";
        row.innerHTML = `
            <div class="col-md-2">
                <img src="${item.img}" class="img-fluid rounded-2 shadow-sm" alt="${item.nombre}">
            </div>
            <div class="col-md-3">
                <h6 class="text-dark mb-0">${item.nombre}</h6>
                <small class="text-muted">$${item.precio.toFixed(2)} c/u</small>
            </div>
            <div class="col-md-3 d-flex align-items-center justify-content-center">
                <button class="btn btn-sm btn-outline-dark" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <span class="mx-3 fw-bold">${item.cantidad}</span>
                <button class="btn btn-sm btn-outline-dark" onclick="cambiarCantidad(${item.id}, 1)">+</button>
            </div>
            <div class="col-md-3 text-center">
                <h6 class="mb-0 fw-bold">$${subtotal.toFixed(2)}</h6>
            </div>
            <div class="col-md-1 text-end">
                <button class="btn btn-link text-danger p-0" onclick="eliminarDelCarrito(${item.id})">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(row);
    });

    // Actualizar precios en el resumen
    const precioFormateado = `$${totalAcumulado.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    if (totalFinalElemento) totalFinalElemento.textContent = precioFormateado;
    if (resumenArticulos) resumenArticulos.textContent = precioFormateado;
}

// --- EXPORTACIÓN AL ÁMBITO GLOBAL ---
// Vital para que los onclick de los botones y el modal funcionen
window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;