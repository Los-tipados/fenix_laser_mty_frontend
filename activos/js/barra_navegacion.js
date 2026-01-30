fetch("/paginas/barra_de_navegacion.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar").innerHTML = html;
  });

  // Barra de navegación  