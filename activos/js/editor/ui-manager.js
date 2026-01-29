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
        <div style="margin-left: auto">
            <button class="btn-orange" id="btn-export">Descargar PNG</button>
        </div>
    `;

    // Vinculación de eventos de la barra de herramientas a la lógica de negocio
    document.getElementById('font-down').onclick = () => CanvasLogic.changeFontSize(-2, updateUI);
    document.getElementById('font-up').onclick = () => CanvasLogic.changeFontSize(2, updateUI);
    document.getElementById('btn-bold').onclick = () => CanvasLogic.toggleFormat('bold');
    document.getElementById('btn-italic').onclick = () => CanvasLogic.toggleFormat('italic');
    document.getElementById('btn-delete').onclick = () => CanvasLogic.deleteObject();
    document.getElementById('btn-export').onclick = () => CanvasLogic.exportDesign();
}
