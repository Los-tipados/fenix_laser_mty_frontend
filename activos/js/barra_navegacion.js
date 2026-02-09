// /activos/js/barra_navegacion.js

fetch("/paginas/barra_de_navegacion.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar").innerHTML = html;

    console.log("Navbar cargada, sincronizando badge...");

    // Buscar el carrito en el localStorage
    const saved = localStorage.getItem('carritoFenixLaser');
    const carrito = saved ? JSON.parse(saved) : [];

    // Función para actualizar los números
    //  Una vez cargada la barra, ejecutamos la actualización
    if (typeof window.actualizarBadge === 'function') {
      const saved = localStorage.getItem('carritoFenixLaser');
      const carrito = saved ? JSON.parse(saved) : [];
      window.actualizarBadge(carrito);
    }
  })
  .catch(err => console.error("Error al cargar la barra:", err));