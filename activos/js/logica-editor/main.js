import { CONFIG } from './config.js';
import * as CanvasLogic from './canvas-logic.js';
import * as UIManager from './ui-manager.js';

window.onload = () => {
    // Inicializar Canvas pasando los callbacks de actualización de UI
    CanvasLogic.initCanvas(UIManager.updateUI, UIManager.clearUIIndicator);
    
    // Inicializar UI
    UIManager.renderSidebar();
    UIManager.renderToolbar();

    // Estado inicial
    CanvasLogic.changeCanvasBackground(CONFIG.productos[0].url);
};

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const container = document.querySelector('.canvas-area');
        
        // 1. Calculamos nuevas dimensiones
        const newWidth = Math.min(container.clientWidth - 40, 700);
        const newHeight = Math.min(container.clientHeight - 40, 600);

        // 2. Aplicamos dimensiones al canvas
        CanvasLogic.canvas.setDimensions({
            width: newWidth,
            height: newHeight
        });

        // 3. RE-AJUSTAMOS EL FONDO (Esto evita que se vea recortado)
        CanvasLogic.resizeBackground();
        
        // 4. Centramos los objetos (opcional, para que no queden fuera de vista)
        CanvasLogic.canvas.renderAll();
    }, 200);
});