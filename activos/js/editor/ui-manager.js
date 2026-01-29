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