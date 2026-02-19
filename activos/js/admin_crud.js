// ========================================
// PANEL DE ADMINISTRACIÓN - FÉNIX LÁSER
// Conectado a Spring Boot API
// ========================================

const PASSWORD = 'admin123';
const API_BASE = 'http://localhost:8080/api/v1';

let allProducts = [];
let categorias  = [];
let etiquetas   = [];

// ========================================
// FUNCIÓN GENÉRICA DE LLAMADA A LA API
// ========================================
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (!response.ok) {
        const errorText = await response.text().catch(() => `Error ${response.status}`);
        throw new Error(errorText || `Error del servidor: ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
}

// ========================================
// CARGAR DATOS INICIALES
// ========================================
async function loadAll() {
    try {
        [allProducts, categorias, etiquetas] = await Promise.all([
            apiCall('/products'),
            apiCall('/categorias'),
            apiCall('/etiquetas')
        ]);

        poblarSelectCategorias();
        poblarCheckboxEtiquetas();
        renderAdminList();

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error al cargar datos', text: error.message });
    }
}

// ========================================
// POBLAR SELECT DE CATEGORÍAS
// ========================================
function poblarSelectCategorias(idSeleccionado = null) {
    const select = document.getElementById('categoriaSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- Selecciona --</option>';
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value       = cat.idCategoria;
        option.textContent = cat.nombre;
        if (idSeleccionado && cat.idCategoria === idSeleccionado) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// ========================================
// POBLAR CHECKBOXES DE ETIQUETAS
// ========================================
function poblarCheckboxEtiquetas(seleccionadas = []) {
    const container = document.getElementById('etiquetasContainer');
    if (!container) return;

    container.innerHTML = '';
    etiquetas.forEach(et => {
        const estaSeleccionada = seleccionadas.some(s => s.idEtiqueta === et.idEtiqueta);
        const div = document.createElement('div');
        div.className = 'form-check form-check-inline';
        div.innerHTML = `
            <input class="form-check-input etiqueta-check" type="checkbox"
                   id="etiqueta_${et.idEtiqueta}" value="${et.idEtiqueta}"
                   ${estaSeleccionada ? 'checked' : ''}>
            <label class="form-check-label" for="etiqueta_${et.idEtiqueta}">
                ${et.nombreEtiqueta}
            </label>
        `;
        container.appendChild(div);
    });
}

// ========================================
// CREAR NUEVA CATEGORÍA DESDE EL MODAL
// ========================================
async function crearCategoria() {
    const input = document.getElementById('inputNuevaCategoria');
    const nombre = input.value.trim();

    if (!nombre || nombre.length < 2) {
        input.classList.add('is-invalid');
        return;
    }
    input.classList.remove('is-invalid');

    try {
        const nueva = await apiCall('/categorias', 'POST', { nombre });
        categorias.push(nueva);

        // Actualizar el select y seleccionar la nueva categoría automáticamente
        poblarSelectCategorias(nueva.idCategoria);

        // Ocultar formulario y limpiar input
        input.value = '';
        document.getElementById('formNuevaCategoria').classList.add('d-none');

        Swal.fire({
            icon: 'success',
            title: `Categoría "${nueva.nombre}" creada`,
            timer: 1800,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

// ========================================
// CREAR NUEVA ETIQUETA DESDE EL MODAL
// ========================================
async function crearEtiqueta() {
    const input = document.getElementById('inputNuevaEtiqueta');
    const nombreEtiqueta = input.value.trim();

    if (!nombreEtiqueta || nombreEtiqueta.length < 2) {
        input.classList.add('is-invalid');
        return;
    }
    input.classList.remove('is-invalid');

    try {
        const nueva = await apiCall('/etiquetas', 'POST', { nombreEtiqueta });
        etiquetas.push(nueva);

        // Recargar checkboxes manteniendo los que ya estaban marcados
        const marcadas = [...document.querySelectorAll('.etiqueta-check:checked')]
            .map(cb => etiquetas.find(e => e.idEtiqueta === parseInt(cb.value)))
            .filter(Boolean);

        poblarCheckboxEtiquetas([...marcadas, nueva]);

        // Ocultar formulario y limpiar input
        input.value = '';
        document.getElementById('formNuevaEtiqueta').classList.add('d-none');

        Swal.fire({
            icon: 'success',
            title: `Etiqueta "${nueva.nombreEtiqueta}" creada`,
            timer: 1800,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

// ========================================
// RENDERIZAR TARJETAS
// ========================================
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
                <img src="${p.imagen || ''}" class="card-img-top" alt="${p.nombre || 'Sin nombre'}"
                     onerror="this.src='https://via.placeholder.com/300x180?text=Sin+Imagen'">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title mb-2">${p.nombre || '—'}</h6>
                    <div class="small mb-2">
                        <strong>$${Number(p.precio || 0).toLocaleString('es-MX')}</strong> •
                        ${p.categoria?.nombre || '—'}
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

// ========================================
// ABRIR MODAL NUEVO / EDITAR
// ========================================
function openModal(index = -1) {
    const modal    = new bootstrap.Modal(document.getElementById('productModal'));
    const title    = document.getElementById('productModalLabel');
    const idxInput = document.getElementById('edit-index');

    // Asegurar que los formularios inline estén ocultos al abrir
    document.getElementById('formNuevaCategoria').classList.add('d-none');
    document.getElementById('formNuevaEtiqueta').classList.add('d-none');
    document.getElementById('inputNuevaCategoria').value = '';
    document.getElementById('inputNuevaEtiqueta').value  = '';

    if (index === -1) {
        title.textContent = 'Nuevo Producto';
        document.getElementById('product-form').reset();
        document.getElementById('visibleCatalogo').checked    = true;
        document.getElementById('visibleRecomendados').checked = false;
        document.getElementById('rating').value    = '4.5';
        document.getElementById('idProducto').value = '';
        idxInput.value = '-1';
        poblarSelectCategorias();
        poblarCheckboxEtiquetas([]);
    } else {
        const p = allProducts[index];
        title.textContent = 'Editar Producto';
        idxInput.value = index;

        document.getElementById('nombre').value               = p.nombre || '';
        document.getElementById('imagen').value               = p.imagen || '';
        document.getElementById('precio').value               = p.precio || '';
        document.getElementById('descripcion').value          = p.descripcion || '';
        document.getElementById('rating').value               = p.rating || '4.5';
        document.getElementById('visibleCatalogo').checked    = p.visibleCatalogo !== false;
        document.getElementById('visibleRecomendados').checked = !!p.visibleRecomendados;
        document.getElementById('idProducto').value           = p.idProducto || '';

        poblarSelectCategorias(p.categoria?.idCategoria || null);
        poblarCheckboxEtiquetas(p.etiquetas || []);
    }

    modal.show();
}

// ========================================
// RESETEAR PREVIEW DE IMAGEN
// ========================================
function resetPreview() {
    const previewImg  = document.getElementById('image-preview');
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

// ========================================
// EVENTOS
// ========================================
document.addEventListener('DOMContentLoaded', () => {

    // --- Login ---
    document.getElementById('login-form')?.addEventListener('submit', e => {
        e.preventDefault();
        if (document.getElementById('admin-password').value === PASSWORD) {
            document.getElementById('login-section').classList.add('d-none');
            document.getElementById('admin-content').classList.remove('d-none');
            loadAll();
        } else {
            Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'Contraseña incorrecta.' });
        }
    });

    // --- Botón Nuevo Producto ---
    document.getElementById('btn-nuevo')?.addEventListener('click', () => openModal(-1));

    // --- Mostrar/ocultar formulario de nueva categoría ---
    document.getElementById('btnNuevaCategoria')?.addEventListener('click', () => {
        document.getElementById('formNuevaCategoria').classList.toggle('d-none');
        document.getElementById('inputNuevaCategoria').focus();
    });

    document.getElementById('btnCancelarCategoria')?.addEventListener('click', () => {
        document.getElementById('formNuevaCategoria').classList.add('d-none');
        document.getElementById('inputNuevaCategoria').value = '';
    });

    document.getElementById('btnGuardarCategoria')?.addEventListener('click', crearCategoria);

    // Guardar categoría presionando Enter
    document.getElementById('inputNuevaCategoria')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); crearCategoria(); }
    });

    // --- Mostrar/ocultar formulario de nueva etiqueta ---
    document.getElementById('btnNuevaEtiqueta')?.addEventListener('click', () => {
        document.getElementById('formNuevaEtiqueta').classList.toggle('d-none');
        document.getElementById('inputNuevaEtiqueta').focus();
    });

    document.getElementById('btnCancelarEtiqueta')?.addEventListener('click', () => {
        document.getElementById('formNuevaEtiqueta').classList.add('d-none');
        document.getElementById('inputNuevaEtiqueta').value = '';
    });

    document.getElementById('btnGuardarEtiqueta')?.addEventListener('click', crearEtiqueta);

    // Guardar etiqueta presionando Enter
    document.getElementById('inputNuevaEtiqueta')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); crearEtiqueta(); }
    });

    // --- Guardar producto ---
    document.getElementById('product-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        e.stopPropagation();

        const form = e.target;
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        let isValid = true;

        const nombre = document.getElementById('nombre');
        if (!nombre.value.trim() || nombre.value.trim().length < 3) {
            nombre.classList.add('is-invalid'); isValid = false;
        }

        const imagen = document.getElementById('imagen');
        if (!imagen.value.trim() || !/^https?:\/\/.+/i.test(imagen.value.trim())) {
            imagen.classList.add('is-invalid'); isValid = false;
        }

        const precio = document.getElementById('precio');
        const precioVal = parseFloat(precio.value);
        if (isNaN(precioVal) || precioVal < 1) {
            precio.classList.add('is-invalid'); isValid = false;
        }

        const rating = document.getElementById('rating');
        const ratingVal = parseFloat(rating.value);
        if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) {
            rating.classList.add('is-invalid'); isValid = false;
        }

        const categoriaSelect = document.getElementById('categoriaSelect');
        if (!categoriaSelect.value) {
            categoriaSelect.classList.add('is-invalid'); isValid = false;
        }

        if (!isValid) { form.querySelector('.is-invalid')?.focus(); return; }

        const idx        = parseInt(document.getElementById('edit-index').value);
        const idProducto = document.getElementById('idProducto').value.trim();

        const etiquetasSeleccionadas = [...document.querySelectorAll('.etiqueta-check:checked')]
            .map(cb => etiquetas.find(e => e.idEtiqueta === parseInt(cb.value)))
            .filter(Boolean);

        const producto = {
            nombre:              nombre.value.trim(),
            imagen:              imagen.value.trim(),
            precio:              precioVal,
            descripcion:         document.getElementById('descripcion').value.trim(),
            rating:              ratingVal,
            visibleCatalogo:     document.getElementById('visibleCatalogo').checked,
            visibleRecomendados: document.getElementById('visibleRecomendados').checked,
            categoria:           { idCategoria: parseInt(categoriaSelect.value) },
            etiquetas:           etiquetasSeleccionadas
        };

        try {
            if (idx === -1) {
                const nuevo = await apiCall('/new-product', 'POST', producto);
                allProducts.push(nuevo);
            } else {
                const actualizado = await apiCall(`/update-producto/${idProducto}`, 'PUT', producto);
                allProducts[idx] = actualizado;
            }

            renderAdminList();
            Swal.fire({
                icon: 'success',
                title: idx === -1 ? 'Producto creado' : 'Producto actualizado',
                timer: 2200,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                iconColor: '#F2A23A'
            });
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();

        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al guardar', text: error.message });
        }
    });

    // --- Editar / Eliminar ---
    document.getElementById('admin-product-list')?.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const index = parseInt(btn.dataset.index);

        if (btn.classList.contains('edit-btn')) {
            openModal(index);
        } else if (btn.classList.contains('delete-btn')) {
            const productoNombre = allProducts[index]?.nombre || 'este producto';
            const idProducto     = allProducts[index]?.idProducto;

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
            }).then(async result => {
                if (result.isConfirmed) {
                    try {
                        await apiCall(`/delete-product/${idProducto}`, 'DELETE');
                        allProducts.splice(index, 1);
                        renderAdminList();
                        Swal.fire({
                            icon: 'success', title: 'Eliminado',
                            timer: 2000, showConfirmButton: false,
                            toast: true, position: 'top-end'
                        });
                    } catch (error) {
                        Swal.fire({ icon: 'error', title: 'Error al eliminar', text: error.message });
                    }
                }
            });
        }
    });

    // --- Exportar JSON ---
    document.getElementById('export-json')?.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(allProducts, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `productos_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // --- Preview de imagen ---
    const imgInput = document.getElementById('imagen');
    if (imgInput) {
        const previewImg  = document.getElementById('image-preview');
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
                        No se pudo cargar la imagen<br><small>Verifica la URL</small>
                    `;
                };
                previewImg.onload = () => { placeholder.innerHTML = ''; };
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