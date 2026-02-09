/**
 * @module UIManager
 * @description Orquestador de la interfaz de usuario. Gestiona el renderizado de menús,
 * la manipulación del DOM y la vinculación de eventos entre la UI y la lógica del canvas.
 */

import { CONFIG } from './config.js';
import * as CanvasLogic from './canvas-logic.js';

/** @type {string|null} Almacena el ID de la pestaña lateral actualmente visible */
let activeTab = null;

/**
 * Renderiza los iconos de navegación en el sidebar principal.
 * Utiliza los datos definidos en CONFIG.menu.
 */
export function renderSidebar() {
    const nav = document.getElementById('mainNav');
    
    // Generación dinámica de la estructura HTML del menú
    nav.innerHTML = CONFIG.menu.map(item => `
        <div class="icon-unit" id="nav-${item.id}" data-id="${item.id}">
            <span>${item.icon}</span>${item.label}
        </div>
    `).join('');

    /**
     * Delegación de eventos: Se asigna el listener de click a cada unidad de icono
     * para alternar la visibilidad de los paneles laterales.
     */
    nav.querySelectorAll('.icon-unit').forEach(el => {
        el.onclick = () => togglePanel(el.dataset.id);
    });
}

/**
 * Construye la barra de herramientas superior y asigna los listeners a los controles.
 * Conecta botones (negrita, borrar, exportar, etc.) con sus respectivas funciones en CanvasLogic.
 */
export function renderToolbar() {
    const toolbar = document.getElementById('mainToolbar');
    // Detectamos si es móvil siguiendo tu media query de 768px
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // --- DISEÑO MÓVIL (Optimizado para pulgares y scroll horizontal) ---
        toolbar.innerHTML = `
            <div class="toolbar-scroll-container">
                <div class="tool-group">
                    <button class="btn-tool round" id="font-down">−</button>
                    <div class="size-badge">
                        <small>TAM</small>
                        <span id="size-indicator">30</span>
                    </div>
                    <button class="btn-tool round" id="font-up">+</button>
                </div>

                <div class="divider"></div>

                <div class="tool-group">
                    <button class="btn-tool square" id="btn-bold"><b>B</b></button>
                    <button class="btn-tool square" id="btn-italic"><i>I</i></button>
                    <button class="btn-tool danger" id="btn-delete">🗑️</button>
                </div>

                <div class="divider"></div>

                <div class="tool-group">
                    <button class="btn-tool secondary" id="btn-editor" onclick="history.back()">Salir</button>
                </div>
            </div>

            <div class="export-container">
                <button class="btn-orange main-action" id="btn-export">💾</button>
            </div>
        `;
    } else {
        // --- DISEÑO DESKTOP (Tu código original) ---
        toolbar.innerHTML = `
            <div class="tool-group">
                <span style="font-size: 11px; color: var(--text-dim)">FUENTE</span>
                <button class="btn-tool" id="font-down">−</button>
                <span id="size-indicator">30</span>
                <button class="btn-tool" id="font-up">+</button>
            </div>
            <div class="divider"></div>
            <div class="tool-group">
                <button class="btn-tool" id="btn-bold"><b>B</b></button>
                <button class="btn-tool" id="btn-italic"><i>I</i></button>
            </div>
            <div class="divider"></div>
            <button class="btn-tool" id="btn-delete">🗑️ Eliminar</button>

            <div class="divider"></div>

            <button class="btn-tool" id="btn-editor" onclick="history.back()">
                 Salir del editor
            </button>

            <div style="margin-left: auto">
                <button class="btn-orange" id="btn-export">Descargar PNG</button>
            </div>
        `;
    }

    // Los eventos son los mismos para ambos, así que se quedan fuera del IF
    document.getElementById('font-down').onclick = () => CanvasLogic.changeFontSize(-2, updateUI);
    document.getElementById('font-up').onclick = () => CanvasLogic.changeFontSize(2, updateUI);
    document.getElementById('btn-bold').onclick = () => CanvasLogic.toggleFormat('bold');
    document.getElementById('btn-italic').onclick = () => CanvasLogic.toggleFormat('italic');
    document.getElementById('btn-delete').onclick = () => CanvasLogic.deleteObject();
    document.getElementById('btn-export').onclick = () => CanvasLogic.exportDesign();
}

/**
 * Gestiona el estado de apertura/cierre del panel lateral.
 * @param {string} type - ID de la pestaña (ej. 'texto', 'productos').
 */
function togglePanel(type) {
    const panel = document.getElementById('sidePanel');
    const icons = document.querySelectorAll('.icon-unit');
    
    // Si la pestaña clickeada ya está activa, se cierra el panel (Toggle)
    if (activeTab === type) {
        panel.style.display = 'none';
        activeTab = null;
        icons.forEach(i => i.classList.remove('active'));
    } else {
        // En caso contrario, se abre y se marca como activa
        activeTab = type;
        panel.style.display = 'block';
        icons.forEach(i => i.classList.remove('active'));
        document.getElementById(`nav-${type}`).classList.add('active');
        renderPanelContent(type);
    }
}



/**
 * Genera el contenido dinámico del panel lateral según la pestaña seleccionada.
 * @param {string} type - El tipo de contenido a renderizar.
 */
function renderPanelContent(type) {
    const content = document.getElementById('panelContent');
    let html = `<h3>${type.toUpperCase()}</h3>`;

    // Lógica condicional para inyectar listas de fuentes, productos o figuras
    if (type === 'texto') {
        html += `<button class="btn-orange" style="width:100%; margin-top:15px" id="add-text-btn">+ Agregar Texto</button>
        <div class="list-group">
            ${CONFIG.fuentes.map(f => `<div class="list-item btn-font" data-font="${f}">${f}</div>`).join('')}
        </div>
        `;
    } 
    else if (type === 'productos') {
        html += `<div class="grid-assets">
            ${CONFIG.productos.map(p => `
                <div class="asset-card btn-product" data-url="${p.url}">
                    <img src="${p.url}">
                    <span>${p.nombre}</span>
                </div>
            `).join('')}
        </div>`;
    } 
    // Dentro de renderPanelContent(type)
else if (type === 'figuras') {
    html += `<div class="grid-assets">
        ${CONFIG.figuras.map(f => `
            <div class="asset-card btn-figure" data-url="${f.url}">
                <img src="${f.url}">
                <span>${f.nombre}</span>
            </div>
        `).join('')}
    </div>`;
}
    
    content.innerHTML = html;
    // Es vital re-vincular los eventos cada vez que se regenera el HTML interno
    attachPanelEvents(type);
}




/**
 * Asigna manejadores de eventos a los elementos recién creados dentro del panel lateral.
 * @param {string} type - Tipo de contenido para determinar qué eventos asignar.
 */
function attachPanelEvents(type) {
    const isMobile = window.innerWidth <= 768;

    if (type === 'texto') {
        document.getElementById('add-text-btn').onclick = () => {
            CanvasLogic.addIText();
            // Si es móvil, cerramos el panel para que el usuario vea el texto añadido
            if (isMobile) togglePanel(type); 
        };

        document.querySelectorAll('.btn-font').forEach(el => {
            el.onclick = () => {
                CanvasLogic.changeFont(el.dataset.font);
                // Opcional: No cerramos aquí para que pueda probar varias fuentes seguidas
            };
        });

    } else if (type === 'productos') {
        document.querySelectorAll('.btn-product').forEach(el => {
            el.onclick = () => {
                CanvasLogic.changeCanvasBackground(el.dataset.url);
                // IMPORTANTE: En móvil, cerramos para que vea el producto completo
                // Esto ayuda a evitar el bug del "zoom" al reducir elementos en pantalla
                if (isMobile) togglePanel(type);
            };
        });

    } else if (type === 'figuras') {
        document.querySelectorAll('.btn-figure').forEach(el => {
            el.onclick = () => {
                CanvasLogic.addImage(el.dataset.url);
                // Si es móvil, cerramos para facilitar el posicionamiento de la figura
                if (isMobile) togglePanel(type);
            };
        });
    }
}



/**
 * Sincroniza la información del objeto seleccionado en el canvas con la UI.
 * Específicamente actualiza el indicador de tamaño de fuente.
 */
export function updateUI() {
    const obj = CanvasLogic.canvas.getActiveObject();
    if (obj && obj.fontSize) {
        document.getElementById('size-indicator').innerText = Math.round(obj.fontSize);
    }
}

/**
 * Limpia los indicadores de la interfaz cuando no hay ningún objeto seleccionado.
 */
export function clearUIIndicator() {
    document.getElementById('size-indicator').innerText = '--';
}

/**
 
// Si el usuario hace scroll manual en el área del canvas, 
// asumimos que quiere salir del modo edición de texto.
document.querySelector('.canvas-area').addEventListener('touchstart', () => {
    if (activeTab === 'texto' && window.innerWidth <= 768) {
        // Opcional: podrías cerrar el panel aquí para dar más espacio
    }
}, { passive: true });
* Limpia los indicadores de la interfaz cuando no hay ningún objeto seleccionado.
 */
