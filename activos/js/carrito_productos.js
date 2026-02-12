// --- 1. PERSISTENCIA Y LÓGICA DE DATOS ---

function cargarCarrito() {
    try {
        const saved = localStorage.getItem('carritoFenixLaser');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem('carritoFenixLaser', JSON.stringify(carrito));
}

// --- 2. ACTUALIZACIÓN DEL BADGE (NAVBAR) ---

function actualizarBadge(carrito) {
    // Buscamos todos los badges (móvil y desktop)
    const badges = document.querySelectorAll('#cart-badge, .cart-badge');
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.setProperty('display', 'flex', 'important');
        } else {
            badge.style.display = 'none';
        }
    });
}

// --- 3. FUNCIONES DE ACCIÓN ---

function agregarAlCarrito(product) {
    let carrito = cargarCarrito();
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
}

function cambiarCantidad(id, cambio) {
    let carrito = cargarCarrito();
    const producto = carrito.find(item => item.id == id);
    if (producto) {
        producto.cantidad += cambio;
        if (producto.cantidad <= 0) {
            carrito = carrito.filter(item => item.id != id);
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

// --- 4. RENDERIZADO DE LA INTERFAZ ---

function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-items');
    const totalPrecioFinal = document.getElementById('cart-total'); // El h5 de abajo
    const totalProductosResumen = document.getElementById('resumen-subtotal'); // El span de arriba
    const cantArticulosResumen = document.getElementById('resumen-cant-articulos'); // Contador de piezas

    if (!contenedor) return;

    const carrito = cargarCarrito();

    // Limpiar contenedor con el encabezado básico
    contenedor.innerHTML = `
        <div class="d-flex align-items-center mb-4">
            <a href="/paginas/catalogo.html" class="regresar" style="text-decoration:none; color: #cc3333; font-weight: bold;">← Regresar</a>
            <h4 class="ms-4 mb-0">Carrito de Compras</h4>
        </div>
        <hr>`;

    if (carrito.length === 0) {
        contenedor.innerHTML += '<div class="text-center my-5"><h5>Tu carrito está vacío</h5></div>';
        if (totalPrecioFinal) totalPrecioFinal.textContent = "$0.00";
        if (totalProductosResumen) totalProductosResumen.textContent = "$0.00";
        if (cantArticulosResumen) cantArticulosResumen.textContent = "0";
        return;
    }

    let subtotalCalculado = 0;
    let piezasCalculadas = 0;

    carrito.forEach(item => {
        const filaTotal = item.precio * item.cantidad;
        subtotalCalculado += filaTotal;
        piezasCalculadas += item.cantidad;

        const row = document.createElement('div');
        row.className = "row mb-4 border-bottom pb-3 align-items-center";
        row.innerHTML = `
            <div class="col-2"><img src="${item.img}" class="img-fluid rounded shadow-sm"></div>
            <div class="col-3"><h6>${item.nombre}</h6></div>
            <div class="col-3 d-flex justify-content-center">
                <button class="btn btn-sm btn-outline-dark" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <span class="mx-3 fw-bold">${item.cantidad}</span>
                <button class="btn btn-sm btn-outline-dark" onclick="cambiarCantidad(${item.id}, 1)">+</button>
            </div>
            <div class="col-3 text-center"><h6>$${filaTotal.toFixed(2)}</h6></div>
            <div class="col-1 text-end">
                <button class="btn btn-link text-danger" onclick="eliminarDelCarrito(${item.id})">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(row);
    });

    // --- ACTUALIZAR LOS TOTALES EN EL HTML ---
    const formatoMoneda = `$${subtotalCalculado.toFixed(2)}`;
    
    if (totalPrecioFinal) totalPrecioFinal.textContent = formatoMoneda;
    if (totalProductosResumen) totalProductosResumen.textContent = formatoMoneda;
    if (cantArticulosResumen) cantArticulosResumen.textContent = piezasCalculadas;
}

// --- 5. INICIALIZACIÓN Y EXPORTACIÓN ---

window.agregarAlCarrito = agregarAlCarrito;
window.actualizarBadge = actualizarBadge;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;

document.addEventListener('DOMContentLoaded', () => {
    const carrito = cargarCarrito();
    actualizarBadge(carrito);
    if (document.getElementById('carrito-items')) {
        renderizarCarrito();
    }
    
    const btnVaciar = document.getElementById('vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', () => {
            if (confirm('¿Deseas vaciar todo el carrito?')) {
                localStorage.removeItem('carritoFenixLaser');
                renderizarCarrito();
                actualizarBadge([]);
            }
        });
    }
});