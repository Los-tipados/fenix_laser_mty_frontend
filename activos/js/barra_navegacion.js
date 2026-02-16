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