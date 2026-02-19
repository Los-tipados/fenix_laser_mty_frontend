// ========================================
// BADGE DEL CARRITO
// ========================================
window.actualizarBadgeNavbar = function () {
    const saved = localStorage.getItem('carritoFenixLaser');
    const carrito = saved ? JSON.parse(saved) : [];
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);

    const badges = document.querySelectorAll('.cart-badge');

    if (badges.length === 0) {
        setTimeout(window.actualizarBadgeNavbar, 50);
        return;
    }

    badges.forEach(badge => {
        badge.textContent = totalItems;
        if (totalItems > 0) {
            badge.classList.remove('d-none');
            badge.style.setProperty('display', 'flex', 'important');
        } else {
            badge.classList.add('d-none');
            badge.style.setProperty('display', 'none', 'important');
        }
    });
};

// ========================================
// FUNCIÓN DE ESTADO DE SESIÓN
// Se llama DESPUÉS de que la navbar está inyectada
// ========================================
function actualizarEstadoSesion() {
    const autenticado = localStorage.getItem('autenticado');
    const usuario     = JSON.parse(localStorage.getItem('usuario'));

    const btnInicio          = document.getElementById('btnInicio');
    const btnRegistro        = document.getElementById('btnRegistro');
    const mensajeBienvenida  = document.getElementById('mensajeBienvenida');
    const btnLogout          = document.getElementById('btnLogout');

    // Verificar que los elementos existen antes de manipularlos
    if (!btnInicio || !btnRegistro || !mensajeBienvenida || !btnLogout) {
        console.warn('Elementos de sesión no encontrados en la navbar');
        return;
    }

    if (autenticado === 'true' && usuario) {
        // Usuario autenticado: ocultar login/registro, mostrar nombre y logout
        btnInicio.classList.add('d-none');
        btnRegistro.classList.add('d-none');
        mensajeBienvenida.classList.remove('d-none');
        mensajeBienvenida.textContent = `¡Hola, ${usuario.nombre}!`;
        btnLogout.classList.remove('d-none');
    } else {
        // Sin sesión: mostrar login/registro, ocultar nombre y logout
        btnInicio.classList.remove('d-none');
        btnRegistro.classList.remove('d-none');
        mensajeBienvenida.classList.add('d-none');
        btnLogout.classList.add('d-none');
    }

    // Evento de cerrar sesión
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('autenticado');
        window.location.href = '/index.html';
    });
}

// ========================================
// CARGA DINÁMICA DE LA NAVBAR
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const navbarContainer = document.getElementById('navbar');
    if (!navbarContainer) return;

    fetch('/paginas/barra_de_navegacion.html')
        .then(res => res.text())
        .then(html => {
            navbarContainer.innerHTML = html;

            // Badge del carrito — después de inyectar la navbar
            window.actualizarBadgeNavbar();
            setTimeout(window.actualizarBadgeNavbar, 100);
            setTimeout(window.actualizarBadgeNavbar, 300);

            // Estado de sesión — después de inyectar la navbar
            actualizarEstadoSesion();
        })
        .catch(error => console.error('Error cargando navbar:', error));

});

// ========================================
// EVENTOS EXTERNOS
// ========================================
document.addEventListener('carritoActualizado', () => window.actualizarBadgeNavbar());
window.addEventListener('storage', window.actualizarBadgeNavbar);






/*
// Otra manera mas sencilla de status 
function actualizarEstadoSesion() {
    const usuario = localStorage.getItem("usuario");
    const mensajeBienvenida = document.getElementById("mensajeBienvenida");
    const btnLogout = document.getElementById("btnLogout");

    if (usuario) {
        mensajeBienvenida.textContent = `¡Hola de nuevo ${usuario}!`;
        mensajeBienvenida.classList.remove("oculto");
        btnLogout.classList.remove("oculto");
    } else {
        mensajeBienvenida.classList.add("oculto");
        btnLogout.classList.add("oculto");
    }
}

// Actualizar estado de sesión al cargar la página
document.addEventListener("DOMContentLoaded", actualizarEstadoSesion);

// Escuchar cambios en el almacenamiento local (para actualizaciones de sesión)
window.addEventListener('storage', actualizarEstadoSesion);

// Función para cerrar sesión
document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("usuario");
    actualizarEstadoSesion();
    // Redirigir a la página de inicio o de inicio de sesión
    window.location.href = "/paginas/index.html";
});
*/
