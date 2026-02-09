document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");

  if (!fileInput || !fileList) return;

  fileInput.addEventListener("change", () => {
    const files = fileInput.files;

    if (files.length === 0) {
      fileList.innerHTML = "";
      return;
    }

    let listHTML = "<strong>Archivos seleccionados:</strong><ul>";

    for (let i = 0; i < files.length; i++) {
      listHTML += `<li>${files[i].name}</li>`;
    }

    listHTML += "</ul>";
    fileList.innerHTML = listHTML;
  });
});
