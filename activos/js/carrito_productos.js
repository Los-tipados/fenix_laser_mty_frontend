// --- 1. FUNCIONES GLOBALES (Deben estar disponibles para el Modal) ---

function cargarCarrito() {
    try {
        const saved = localStorage.getItem('carritoFenixLaser');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Error al parsear el carrito:", error);
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem('carritoFenixLaser', JSON.stringify(carrito));
}

function actualizarBadge(carrito) {
    // Buscamos todos los posibles badges (ID y Clase)
    const badges = document.querySelectorAll('#cart-badge, .cart-badge');
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.setProperty('display', 'block', 'important'); // Forzamos que se vea
            badge.classList.remove('d-none'); // Por si Bootstrap lo está ocultando
        } else {
            badge.style.display = 'none';
        }
    });
}

function agregarAlCarrito(product) {
    console.log("Intentando agregar producto:", product);
    let carrito = cargarCarrito();
    
    // Usamos == para comparar IDs por si vienen como string o número
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
    console.log("Carrito actualizado:", carrito);
}

// Estas funciones se usan dentro de la página del carrito
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

// --- 2. EXPOSICIÓN GLOBAL (VITAL PARA EL MODAL) ---
window.agregarAlCarrito = agregarAlCarrito;
window.actualizarBadge = actualizarBadge;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;

// --- 3. LÓGICA DE INTERFAZ (DOM) ---

document.addEventListener('DOMContentLoaded', () => {
    const carrito = cargarCarrito();
    actualizarBadge(carrito);

    // Solo si estamos en la página del carrito ejecutamos el render
    if (document.getElementById('carrito-items')) {
        renderizarCarrito();
        
        const btnVaciar = document.getElementById('vaciar-carrito');
        if (btnVaciar) {
            btnVaciar.addEventListener('click', () => {
                if (confirm('¿Vaciar todo el carrito?')) {
                    localStorage.removeItem('carritoFenixLaser');
                    renderizarCarrito();
                    actualizarBadge([]);
                }
            });
        }
    }
});

function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-items');
    const totalFinalElemento = document.getElementById('cart-total');
    if (!contenedor) return;

    const carrito = cargarCarrito();

    contenedor.innerHTML = `
        <div class="d-flex align-items-center mb-4">
            <a href="/paginas/catalogo.html" class="regresar" style="text-decoration:none; color: #cc3333; font-weight: bold;">← Regresar</a>
            <h4 class="ms-4 mb-0">Carrito de Compras</h4>
        </div>
        <hr>`;

    if (carrito.length === 0) {
        contenedor.innerHTML += '<p class="text-center my-5">El carrito está vacío.</p>';
        if (totalFinalElemento) totalFinalElemento.textContent = "$0.00";
        return;
    }

    let totalGlobal = 0;
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalGlobal += subtotal;
        const row = document.createElement('div');
        row.className = "row mb-4 border-bottom pb-3 align-items-center";
        row.innerHTML = `
            <div class="col-2"><img src="${item.img}" class="img-fluid rounded"></div>
            <div class="col-3"><h6>${item.nombre}</h6></div>
            <div class="col-3 d-flex justify-content-center">
                <button class="btn btn-sm btn-outline-dark" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <span class="mx-2">${item.cantidad}</span>
                <button class="btn btn-sm btn-outline-dark" onclick="cambiarCantidad(${item.id}, 1)">+</button>
            </div>
            <div class="col-3 text-center"><h6>$${subtotal.toFixed(2)}</h6></div>
            <div class="col-1"><button class="btn btn-link text-danger" onclick="eliminarDelCarrito(${item.id})">🗑</button></div>
        `;
        contenedor.appendChild(row);
    });

    if (totalFinalElemento) totalFinalElemento.textContent = `$${totalGlobal.toFixed(2)}`;
}