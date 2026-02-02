// admin.js - Panel de administración completo con SweetAlert2

const PASSWORD = 'admin123';           // ← Cambia esto en producción real
const STORAGE_KEY = 'productos_admin_demo';
const JSON_PATH = '/activos/data/productos.json';    // Ajusta si está en otra carpeta → 'data/productos.json'

let allProducts = [];

// ────────────────────────────────────────────────
// Cargar productos
// ────────────────────────────────────────────────
async function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    allProducts = JSON.parse(saved);
  } else {
    try {
      const res = await fetch(JSON_PATH);
      if (!res.ok) throw new Error('No se pudo cargar productos.json');
      allProducts = await res.json();
      saveProducts(); // Guardamos copia inicial
    } catch (err) {
      console.error('Error al cargar JSON original:', err);
      allProducts = [];
    }
  }
  renderAdminList();
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allProducts));
}

// ────────────────────────────────────────────────
// Renderizar tarjetas en el panel admin
// ────────────────────────────────────────────────
function renderAdminList() {
  const container = document.getElementById('admin-product-list');
  if (!container) return;

  container.innerHTML = '';

  if (allProducts.length === 0) {
    container.innerHTML = '<p class="text-center text-muted py-5 fs-4">No hay productos cargados aún.</p>';
    return;
  }

  allProducts.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    div.innerHTML = `
      <div class="card h-100">
        <img src="${p.img || ''}" class="card-img-top" alt="${p.nombre || 'Sin nombre'}" 
             onerror="this.src='https://via.placeholder.com/300x180?text=Sin+Imagen'">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title mb-2">${p.nombre || '—'}</h6>
          <div class="small mb-2">
            <strong>$${Number(p.precio || 0).toLocaleString('es-MX')}</strong> • 
            ${p.categoria || '—'}
          </div>
          <div class="small mb-3">
            <i class="fas fa-star text-warning"></i> ${p.rating || '—'}
          </div>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary edit-btn" data-index="${i}">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-index="${i}">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

// ────────────────────────────────────────────────
// Abrir modal nuevo / editar
// ────────────────────────────────────────────────
function openModal(index = -1) {
  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  const title = document.getElementById('productModalLabel');
  const idxInput = document.getElementById('edit-index');

  if (index === -1) {
    title.textContent = 'Nuevo Producto';
    document.getElementById('product-form').reset();
    document.getElementById('visibleCatalogo').checked = true;
    document.getElementById('visibleRecomendados').checked = false;
    document.getElementById('rating').value = '4.5';
    idxInput.value = '-1';
  } else {
    const p = allProducts[index];
    title.textContent = 'Editar Producto';
    idxInput.value = index;

    document.getElementById('nombre').value       = p.nombre       || '';
    document.getElementById('img').value          = p.img          || '';
    document.getElementById('precio').value       = p.precio       || '';
    document.getElementById('descripcion').value  = p.descripcion  || '';
    document.getElementById('categoria').value    = p.categoria    || '';
    document.getElementById('rating').value       = p.rating       || '4.5';
    document.getElementById('etiquetas').value    = (p.etiquetas || []).join(', ');
    document.getElementById('visibleCatalogo').checked    = p.visibleCatalogo    !== false;
    document.getElementById('visibleRecomendados').checked = !!p.visibleRecomendados;
  }

  modal.show();
}

// ────────────────────────────────────────────────
// Resetear preview de imagen
// ────────────────────────────────────────────────
function resetPreview() {
  const previewImg = document.getElementById('image-preview');
  const placeholder = document.getElementById('preview-placeholder');
  if (previewImg && placeholder) {
    previewImg.style.display = 'none';
    previewImg.src = '';
    placeholder.style.display = 'block';
    placeholder.innerHTML = `
      <i class="fas fa-image fa-3x mb-2"></i><br>
      Escribe la URL para ver la vista previa
    `;
  }
}

// ────────────────────────────────────────────────
// Eventos
// ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Login
  document.getElementById('login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    if (document.getElementById('admin-password').value === PASSWORD) {
      document.getElementById('login-section').classList.add('d-none');
      document.getElementById('admin-content').classList.remove('d-none');
      loadProducts();
    } else {
      alert('Contraseña incorrecta');
    }
  });

  // Botón Nuevo
  document.getElementById('btn-nuevo')?.addEventListener('click', () => openModal(-1));

  // Guardar producto (con validaciones)
  document.getElementById('product-form')?.addEventListener('submit', e => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.target;
    let isValid = true;

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    // Validaciones
    const nombre = document.getElementById('nombre');
    if (!nombre.value.trim() || nombre.value.trim().length < 3) {
      nombre.classList.add('is-invalid');
      isValid = false;
    }

    const img = document.getElementById('img');
    const urlPattern = /^https?:\/\/.+/i;
    if (!img.value.trim() || !urlPattern.test(img.value.trim())) {
      img.classList.add('is-invalid');
      isValid = false;
    }

    const precio = document.getElementById('precio');
    const precioVal = parseInt(precio.value);
    if (isNaN(precioVal) || precioVal < 1) {
      precio.classList.add('is-invalid');
      isValid = false;
    }

    const rating = document.getElementById('rating');
    const ratingVal = parseFloat(rating.value);
    if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) {
      rating.classList.add('is-invalid');
      isValid = false;
    }

    if (!isValid) {
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    // Guardar
    const idx = parseInt(document.getElementById('edit-index').value);

    const producto = {
      nombre:       nombre.value.trim(),
      img:          img.value.trim(),
      precio:       precioVal,
      descripcion:  document.getElementById('descripcion').value.trim(),
      categoria:    document.getElementById('categoria').value.trim().toLowerCase(),
      rating:       ratingVal,
      visibleCatalogo:    document.getElementById('visibleCatalogo').checked,
      visibleRecomendados: document.getElementById('visibleRecomendados').checked,
      etiquetas:    document.getElementById('etiquetas').value
                        .split(',')
                        .map(t => t.trim())
                        .filter(t => t)
    };

    if (idx === -1) {
      allProducts.push(producto);
    } else {
      allProducts[idx] = producto;
    }

    saveProducts();
    renderAdminList();

    // SweetAlert2 éxito
    const isNew = idx === -1;
    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: isNew ? 'Producto creado correctamente' : 'Producto actualizado correctamente',
      timer: 2200,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      iconColor: '#F2A23A'
    });

    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
  });

  // Editar / Eliminar
  document.getElementById('admin-product-list')?.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const index = parseInt(btn.dataset.index);

    if (btn.classList.contains('edit-btn')) {
      openModal(index);
    } 
    else if (btn.classList.contains('delete-btn')) {
      const productoNombre = allProducts[index]?.nombre || 'este producto';

      Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a eliminar "${productoNombre}". Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#E86C1A',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          allProducts.splice(index, 1);
          saveProducts();
          renderAdminList();

          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El producto ha sido eliminado correctamente',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      });
    }
  });

  // Exportar JSON
  document.getElementById('export-json')?.addEventListener('click', () => {
    const jsonStr = JSON.stringify(allProducts, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productos_actualizados_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Preview de imagen
  const imgInput = document.getElementById('img');
  if (imgInput) {
    const previewImg = document.getElementById('image-preview');
    const placeholder = document.getElementById('preview-placeholder');

    imgInput.addEventListener('input', () => {
      const url = imgInput.value.trim();
      if (url) {
        previewImg.src = url;
        previewImg.style.display = 'block';
        placeholder.style.display = 'none';

        previewImg.onerror = () => {
          previewImg.style.display = 'none';
          placeholder.innerHTML = `
            <i class="fas fa-exclamation-triangle fa-3x mb-2 text-warning"></i><br>
            No se pudo cargar la imagen<br>
            <small>Verifica la URL o permisos</small>
          `;
        };

        previewImg.onload = () => {
          placeholder.innerHTML = '';
        };
      } else {
        resetPreview();
      }
    });

    document.getElementById('productModal').addEventListener('hidden.bs.modal', resetPreview);
    document.getElementById('productModal').addEventListener('show.bs.modal', () => {
      if (document.getElementById('edit-index').value !== '-1') {
        const url = imgInput.value.trim();
        if (url) {
          previewImg.src = url;
          previewImg.style.display = 'block';
          placeholder.style.display = 'none';
        }
      } else {
        resetPreview();
      }
    });
  }
});