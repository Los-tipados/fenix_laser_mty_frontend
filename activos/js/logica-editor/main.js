import { CONFIG } from './config.js';
import * as CanvasLogic from './canvas-logic.js';
import * as UIManager from './ui-manager.js';

window.onload = () => {
    // 1. Inicialización limpia
    CanvasLogic.initCanvas(UIManager.updateUI, UIManager.clearUIIndicator);
    UIManager.renderSidebar();
    UIManager.renderToolbar();

    // Carga inicial del primer producto
    CanvasLogic.changeCanvasBackground(CONFIG.productos[0].url);

    // 2. GESTIÓN DE TECLADO (Solo para móviles)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                // Si el alto disponible es casi el total, el teclado se cerró
                const keyboardClosed = window.visualViewport.height >= window.innerHeight * 0.85;
                
                if (keyboardClosed) {
                    window.scrollTo(0, 0); // Reset de posición de pantalla
                    actualizarDimensionesCanvas(); // Reparar el canvas
                }
            }
        });
    }
};

// 3. GESTIÓN DE VENTANA (Desktop y rotación de tablet)
let resizeTimeout;
window.addEventListener('resize', () => {
    // Evitamos que el resize genérico de móvil interfiera con el visualViewport
    if (window.innerWidth <= 768) return;

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        actualizarDimensionesCanvas();
    }, 200);
});

/**
 * LA LLAVE MAESTRA: Calcula y repara el canvas en cualquier dispositivo
 */
function actualizarDimensionesCanvas() {
    const container = document.querySelector('.canvas-area');
    // Verificamos que el canvas exista para evitar errores en consola
    if (!container || !CanvasLogic.canvas) return;

    const isMobile = window.innerWidth <= 768;
    const margin = isMobile ? 10 : 40;

    // Dimensiones dinámicas
    const newWidth = isMobile 
        ? container.clientWidth - margin 
        : Math.min(container.clientWidth - margin, 700);
    
    const newHeight = isMobile 
        ? container.clientHeight - margin 
        : Math.min(container.clientHeight - margin, 600);

    // Aplicar cambios a Fabric.js
    CanvasLogic.canvas.setDimensions({
        width: newWidth,
        height: newHeight
    });

    // Re-sincronizar coordenadas y fondo
    CanvasLogic.canvas.calcOffset(); 
    CanvasLogic.resizeBackground();
    CanvasLogic.canvas.renderAll();
    
    console.log(`[Layout] Ajustado a ${newWidth}x${newHeight}`);
}