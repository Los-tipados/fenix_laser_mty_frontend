/**
 * @fileoverview Motor lógico para el Editor de Imágenes Pro.
 * Utiliza Fabric.js para la manipulación de objetos en el lienzo.
 * Basado en una arquitectura de configuración centralizada para facilitar la escalabilidad.
 */

/**
 * CONFIGURACIÓN CENTRALIZADA (Catálogo de la App)
 * @description Modifica este objeto para añadir nuevos productos, fuentes o figuras sin tocar la lógica.
 */
const CONFIG = {
    menu: [
        { id: 'texto', icon: 'A', label: 'Texto' },
        { id: 'productos', icon: '📦', label: 'Productos' },
        { id: 'figuras', icon: '⬔', label: 'Figuras' }
    ],
    fuentes: ['Arial', 'Impact', 'Courier New', 'Georgia', 'Verdana'],
    productos: [
        { id: 'p1', nombre: 'Camiseta', url: 'https://i.ibb.co/kTr5z3c/box.webp'},
        { id: 'p2', nombre: 'Taza Coffee', url: 'https://via.placeholder.com/150/000000/FFFFFF?text=Taza' },
        { id: 'p3', nombre: 'Gorra Eco', url: 'https://via.placeholder.com/150/e67e22/FFFFFF?text=Gorra' }
    ],
    figuras: [
        { tipo: 'Rectángulo', action: 'rect' },
        { tipo: 'Círculo', action: 'circle' },
        { tipo: 'Triángulo', action: 'triangle' }
    ]
};

/** @type {fabric.Canvas} Referencia global al lienzo de Fabric.js */
let canvas;

/** @type {string|null} ID de la pestaña activa en el panel lateral */
let activeTab = null;

// ==========================================
// CICLO DE VIDA E INICIALIZACIÓN
// ==========================================

/**
 * Punto de entrada principal. Se ejecuta cuando el DOM está listo.
 */
window.onload = () => {
    initCanvas();
    renderSidebar();
    renderToolbar();

    // Carga el primer producto del catálogo como fondo inicial
    changeCanvasBackground(CONFIG.productos[0].url);
};





/**
 * Inicializa el lienzo de Fabric.js con configuraciones por defecto.
 */
/**
 * Inicializa el lienzo ajustándose al tamaño del contenedor padre.
 * Esto evita que el canvas crezca más que la pantalla.
 */
function initCanvas() {
    // 1. Obtenemos el contenedor donde vive el canvas
    const container = document.querySelector('.canvas-area');
    
    // 2. Calculamos el espacio disponible (restando un pequeño margen)
    const availableWidth = container.clientWidth - 40;
    const availableHeight = container.clientHeight - 40;

    // 3. Inicializamos con el tamaño del contenedor o un máximo deseado
    canvas = new fabric.Canvas('mainCanvas', {
        width: Math.min(availableWidth, 700),  // Máximo 800px de ancho
        height: Math.min(availableHeight, 600), // Máximo 600px de alto
        backgroundColor: '#36363600'
    });

    // Eventos de selección
    canvas.on('selection:created', updateUI);
    canvas.on('selection:updated', updateUI);
    canvas.on('selection:cleared', () => document.getElementById('size-indicator').innerText = '--');
}

// ==========================================
// GESTIÓN DE INTERFAZ DE USUARIO (UI)
// ==========================================

/**
 * Genera dinámicamente los botones de navegación lateral basándose en CONFIG.
 */
function renderSidebar() {
    const nav = document.getElementById('mainNav');
    nav.innerHTML = CONFIG.menu.map(item => `
        <div class="icon-unit" id="nav-${item.id}" onclick="togglePanel('${item.id}')">
            <span>${item.icon}</span>${item.label}
        </div>
    `).join('');
}

/**
 * Construye la barra de herramientas superior (Navbar) con sus botones de control.
 */
function renderToolbar() {
    const toolbar = document.getElementById('mainToolbar');
    toolbar.innerHTML = `
        <div class="tool-group">
            <span style="font-size: 11px; color: var(--text-dim)">FUENTE</span>
            <button class="btn-tool" onclick="changeFontSize(-2)">−</button>
            <span id="size-indicator">30</span>
            <button class="btn-tool" onclick="changeFontSize(2)">+</button>
        </div>
        <div class="divider"></div>
        <div class="tool-group">
            <button class="btn-tool" onclick="toggleFormat('bold')"><b>B</b></button>
            <button class="btn-tool" onclick="toggleFormat('italic')"><i>I</i></button>
        </div>
        <div class="divider"></div>
        <button class="btn-tool" onclick="deleteObject()">🗑️ Eliminar</button>
        
        <div style="margin-left: auto">
            <button class="btn-orange" onclick="exportDesign()">Descargar PNG</button>
        </div>
    `;
}

/**
 * Gestiona la apertura/cierre del panel lateral y actualiza el estado visual del menú.
 * @param {string} type - El identificador de la pestaña (ej: 'productos').
 */
function togglePanel(type) {
    const panel = document.getElementById('sidePanel');
    const icons = document.querySelectorAll('.icon-unit');
    
    if (activeTab === type) {
        panel.style.display = 'none';
        activeTab = null;
        icons.forEach(i => i.classList.remove('active'));
    } else {
        activeTab = type;
        panel.style.display = 'block';
        icons.forEach(i => i.classList.remove('active'));
        document.getElementById(`nav-${type}`).classList.add('active');
        renderPanelContent(type);
    }
}

/**
 * Ajusta una imagen como fondo fijo del canvas, escalándola para cubrir el área.
 */
function changeCanvasBackground(url) {
    if (!url) return;

    fabric.Image.fromURL(url, (img) => {
        // 1. Calculamos la escala necesaria para que la imagen encaje en el canvas
        // Usamos 'Math.max' para que cubra todo el fondo (Aspect Fill)
        // O puedes usar 'Math.min' si quieres que se vea la imagen completa (Aspect Fit)
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        
        // 2. Aplicamos la imagen como fondo
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            // Escalado
            scaleX: scale,
            scaleY: scale,
            // Centrado de la imagen
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            crossOrigin: 'anonymous'
        });
    }, { crossOrigin: 'anonymous' });
}




/**
 * Genera el contenido HTML dinámico dentro del panel lateral.
 * Se ha actualizado la sección de productos para que actúen como fondos de lienzo.
 * @param {string} type - Tipo de contenido a renderizar (texto, productos, figuras).
 */
function renderPanelContent(type) {
    const content = document.getElementById('panelContent');
    let html = `<h3>${type.toUpperCase()}</h3>`;

    if (type === 'texto') {
        html += `<div class="list-group">
            ${CONFIG.fuentes.map(f => `<div class="list-item" onclick="changeFont('${f}')">${f}</div>`).join('')}
        </div>
        <button class="btn-orange" style="width:100%; margin-top:15px" onclick="addIText()">+ Agregar Texto</button>`;
    } 
    
    else if (type === 'productos') {
        // CAMBIO AQUÍ: Ahora llama a changeCanvasBackground en lugar de addImg
        html += `<div class="grid-assets">
            ${CONFIG.productos.map(p => `
                <div class="asset-card" onclick="changeCanvasBackground('${p.url}')">
                    <img src="${p.url}">
                    <span>${p.nombre}</span>
                </div>
            `).join('')}
        </div>`;
    } 
    
    else if (type === 'figuras') {
        html += `<div class="list-group">
            ${CONFIG.figuras.map(f => `
                <div class="list-item" onclick="addShape('${f.action}')">Añadir ${f.tipo}</div>
            `).join('')}
        </div>`;
    }
    
    content.innerHTML = html;
}

// ==========================================
// OPERACIONES DEL LIENZO (FABRIC.JS)
// ==========================================

/**
 * Añade un campo de texto interactivo al lienzo.
 */
function addIText() {
    const text = new fabric.IText('Escribe aquí', {
        left: 100, top: 100, fontSize: 30, fontFamily: 'Arial', fill: '#333'
    });
    canvas.add(text).setActiveObject(text);
}

/**
 * Carga una imagen externa y la añade al lienzo.
 * @param {string} url - Ruta de la imagen.
 */
function addImg(url) {
    fabric.Image.fromURL(url, (img) => {
        img.scaleToWidth(150);
        canvas.add(img).centerObject(img).setActiveObject(img);
    }, { crossOrigin: 'anonymous' });
}

/**
 * Crea y añade una figura geométrica al lienzo.
 * @param {string} type - 'rect', 'circle' o 'triangle'.
 */
function addShape(type) {
    let shape;
    const common = { left: 150, top: 150, fill: '#e67e22', width: 100, height: 100 };
    if(type === 'rect') shape = new fabric.Rect(common);
    if(type === 'circle') shape = new fabric.Circle({...common, radius: 50});
    if(type === 'triangle') shape = new fabric.Triangle(common);
    canvas.add(shape).setActiveObject(shape);
}

/**
 * Cambia la familia tipográfica del objeto de texto seleccionado.
 * @param {string} font - Nombre de la fuente (ej: 'Impact').
 */
function changeFont(font) {
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        obj.set('fontFamily', font);
        canvas.renderAll();
    }
}

/**
 * Modifica el tamaño de la fuente del objeto seleccionado.
 * @param {number} delta - Cantidad de píxeles a sumar o restar.
 */
function changeFontSize(delta) {
    const obj = canvas.getActiveObject();
    if (obj && obj.fontSize) {
        obj.set('fontSize', obj.fontSize + delta);
        updateUI();
        canvas.renderAll();
    }
}

/**
 * Alterna formatos de estilo (Bold/Italic) en el objeto seleccionado.
 * @param {string} format - 'bold' o 'italic'.
 */
function toggleFormat(format) {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    if (format === 'bold') obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
    if (format === 'italic') obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
    canvas.renderAll();
}

/**
 * Elimina todos los objetos seleccionados actualmente del lienzo.
 */
function deleteObject() {
    const active = canvas.getActiveObjects();
    if (active) {
        canvas.discardActiveObject();
        canvas.remove(...active);
    }
}

/**
 * Sincroniza la información de la Navbar superior con las propiedades del objeto activo.
 */
function updateUI() {
    const obj = canvas.getActiveObject();
    if (obj && obj.fontSize) {
        document.getElementById('size-indicator').innerText = Math.round(obj.fontSize);
    }
}

/**
 * Exporta el contenido actual del lienzo a un archivo PNG y dispara la descarga.
 */
function exportDesign() {
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'diseno-pro.png';
    link.href = dataURL;
    link.click();


    /**
 * Escucha el cambio de tamaño de la ventana para ajustar el lienzo.
 * Se usa un pequeño 'debounce' para no sobrecargar el procesador.
 */
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const container = document.querySelector('.canvas-area');
        
        // Ajustamos solo si el contenedor es más pequeño que el canvas actual
        if (container.clientWidth < canvas.width || container.clientHeight < canvas.height) {
            canvas.setDimensions({
                width: container.clientWidth - 40,
                height: container.clientHeight - 40
            });
            canvas.renderAll();
        }
    }, 200); // Espera 200ms tras dejar de mover la ventana
});
}