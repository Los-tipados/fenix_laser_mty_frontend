fetch("barra_navegacion.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar").innerHTML = html;
  });