window.actualizarBadgeNavbar = function() {
    const saved = localStorage.getItem('carritoFenixLaser');
    const carrito = saved ? JSON.parse(saved) : [];
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    
    const badges = document.querySelectorAll('.cart-badge');

    if (badges.length === 0) {
        // Los badges aún no existen, reintentar
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

// Carga dinámica de la navbar
document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.getElementById("navbar");
    if (!navbarContainer) return;

    fetch("/paginas/barra_de_navegacion.html")
        .then(res => res.text())
        .then(html => {
            navbarContainer.innerHTML = html;
            console.log("Navbar inyectada");
            
            // Actualizar inmediatamente y con reintentos
            window.actualizarBadgeNavbar();
            setTimeout(window.actualizarBadgeNavbar, 100);
            setTimeout(window.actualizarBadgeNavbar, 300);
        })
        .catch(error => console.error("Error cargando navbar:", error));
});

// Escuchar eventos personalizados del carrito
document.addEventListener('carritoActualizado', () => {
    window.actualizarBadgeNavbar();
});

// Escuchar cambios de otros tabs/windows
window.addEventListener('storage', window.actualizarBadgeNavbar);







//Funcion para status de login
document.addEventListener('DOMContentLoaded', () => {
    const autenticado = localStorage.getItem('autenticado');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const btnInicio = document.getElementById('btnInicio');
    const btnRegistro = document.getElementById('btnRegistro');
    const mensajeBienvenida = document.getElementById('mensajeBienvenida');
    const btnLogout = document.getElementById('btnLogout');

    if (autenticado === 'true' && usuario) {
        btnInicio.classList.add("oculto");
        btnRegistro.classList.add("oculto");
        mensajeBienvenida.classList.remove("oculto");
        mensajeBienvenida.textContent = "Bienvenido de nuevo " + usuario.nombre;
        btnLogout.classList.remove("oculto");
    } else {
        btnInicio.classList.remove("oculto");
        btnRegistro.classList.remove("oculto");
        mensajeBienvenida.classList.add("oculto");
        btnLogout.classList.add("oculto");
    }

    // Evento de logout
    btnLogout.addEventListener('click', () => {
        /*localStorage.removeItem('token'); Solo si se agrega token*/
        localStorage.removeItem('usuario');
        localStorage.removeItem('autenticado');
        window.location.href = '/login.html'; // redirige al login
    });
});






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