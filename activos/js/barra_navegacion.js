// /activos/js/barra_navegacion.js

fetch("/paginas/barra_de_navegacion.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar").innerHTML = html;

    // --- LÓGICA PARA EL BADGE ---
    // Verificar si la función existe 
    if (typeof actualizarBadge === 'function') {
        const saved = localStorage.getItem('carritoFenixLaser');
        const carrito = saved ? JSON.parse(saved) : [];
        actualizarBadge(carrito);
    }
  })
  .catch(err => console.error("Error cargando la barra:", err));