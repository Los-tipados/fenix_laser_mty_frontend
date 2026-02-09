

/**
 * @module CanvasLogic
 * @description Operaciones de bajo nivel para la manipulación del lienzo de Fabric.js.
 * Este módulo actúa como la capa de servicio entre la librería y la interfaz de usuario.
 */

/** @type {fabric.Canvas} Instancia global del lienzo */
export let canvas;

/**
 * Inicializa el lienzo ajustándolo al espacio disponible en el contenedor.
 * @param {Function} onSelection - Callback ejecutado cuando se selecciona un objeto.
 * @param {Function} onCleared - Callback ejecutado cuando se pierde la selección.
 */
export function initCanvas(onSelection, onCleared) {
    const container = document.querySelector('.canvas-area');
    const isMobile = window.innerWidth <= 768;

    // 1. En móvil reducimos el margen para aprovechar cada píxel
    const margin = isMobile ? 10 : 40;
    
    // 2. Forzamos al contenedor a darnos su ancho real antes del cálculo
    const availableWidth = container.clientWidth - margin;
    const availableHeight = container.clientHeight - margin;

    // 3. Definimos límites según dispositivo
    // En móvil queremos que sea casi cuadrado o vertical, en PC horizontal.
    const maxWidth = isMobile ? availableWidth : 900; 
    const maxHeight = isMobile ? Math.min(availableHeight, 500) : 600;

    canvas = new fabric.Canvas('mainCanvas', {
        width: Math.min(availableWidth, maxWidth),
        height: Math.min(availableHeight, maxHeight),
        backgroundColor: null // Transparente
    });

// === FIX PARA MÓVIL: REPARACIÓN TRAS TECLADO ===
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            // Si el alto del viewport vuelve a ser casi el total de la ventana (teclado cerrado)
            if (window.visualViewport.height >= window.innerHeight * 0.85) {
                
                // 1. Reset de posición (evita que la Navbar se quede cortada)
                window.scrollTo(0, 0);
                
                // 2. Recalcular coordenadas del canvas (corrige el bug de puntero/zoom)
                canvas.calcOffset();
                
                // 3. Re-ajustar el fondo para que no se vea "cortado"
                // Usamos tu función existente que ya tiene la lógica de escalado
                resizeBackground();
                
                canvas.renderAll();
                console.log("Sistema: Vista restaurada tras cierre de teclado.");
            }
        });
    }





    // ... resto de tus eventos ...
    canvas.on('selection:created', onSelection);
    canvas.on('selection:updated', onSelection);
    canvas.on('selection:cleared', onCleared);
}



/**
 * Establece una imagen como fondo del lienzo con escalado inteligente según el dispositivo.
 * @param {string} url - Ruta o URL de la imagen de fondo.
 */
export function changeCanvasBackground(url) {
    if (!url) return;
    
    // 1. Detectamos si estamos en móvil (usando el ancho de la ventana)
    const isMobile = window.innerWidth <= 768;

    fabric.Image.fromURL(url, (img) => {
        /**
         * 2. Algoritmo de escalado dinámico:
         * Desktop (Cover): Math.max -> Llena todo el espacio, puede recortar bordes.
         * Mobile (Contain): Math.min -> Asegura que TODA la imagen sea visible.
         */
        const scale = isMobile 
            ? Math.min(canvas.width / img.width, canvas.height / img.height)
            : Math.max(canvas.width / img.width, canvas.height / img.height);
        
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: scale,
            scaleY: scale,
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            crossOrigin: 'anonymous'
        });
    }, { crossOrigin: 'anonymous' });
}

/**
 * Agrega un objeto de texto interactivo (IText) al lienzo.
 */
export function addIText() {
    const text = new fabric.IText('Escribe aquí', {
        left: 100, 
        top: 100, 
        fontSize: 30, 
        fontFamily: 'Arial', 
        fill: '#333'
    });
    canvas.add(text).setActiveObject(text);
}

/**
 * Añade una imagen (sticker o figura prediseñada) al lienzo como objeto interactivo.
 * @param {string} url - Ruta de la imagen.
 */
export function addImage(url) {
    if (!url) return;

    fabric.Image.fromURL(url, (img) => {
        // Escalamos la imagen para que no aparezca gigante
        img.scaleToWidth(150);
        
        // La centramos y la añadimos
        canvas.add(img);
        canvas.centerObject(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
}

/**
 * Cambia la familia tipográfica del objeto de texto actualmente seleccionado.
 * @param {string} font - Nombre de la fuente (ej. 'Verdana').
 */
export function changeFont(font) {
    const obj = canvas.getActiveObject();
    // Verificamos que el objeto seleccionado admita propiedades de texto
    if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        obj.set('fontFamily', font);
        canvas.renderAll();
    }
}

/**
 * Incrementa o decrementa el tamaño de fuente del objeto activo.
 * @param {number} delta - Píxeles a sumar (positivo) o restar (negativo).
 * @param {Function} [callbackUI] - Función opcional para actualizar indicadores en la UI.
 */
export function changeFontSize(delta, callbackUI) {
    const obj = canvas.getActiveObject();
    if (obj && obj.fontSize) {
        obj.set('fontSize', obj.fontSize + delta);
        canvas.renderAll();
        if(callbackUI) callbackUI();
    }
}

/**
 * Alterna el estilo de texto (Negrita o Cursiva) del objeto seleccionado.
 * @param {'bold'|'italic'} format - El formato a aplicar.
 */
export function toggleFormat(format) {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    
    if (format === 'bold') {
        obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
    }
    if (format === 'italic') {
        obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
    }
    canvas.renderAll();
}

/**
 * Elimina de forma segura todos los objetos que estén seleccionados.
 */
export function deleteObject() {
    const active = canvas.getActiveObjects();
    if (active) {
        canvas.discardActiveObject(); // Deseleccionar antes de borrar para evitar errores de renderizado
        canvas.remove(...active);
    }
}

/**
 * Captura el contenido actual del lienzo y dispara la descarga en formato PNG.
 */
export function exportDesign() {
    const dataURL = canvas.toDataURL({ 
        format: 'png', 
        quality: 1,
        multiplier: 2 // Exporta al doble de resolución para mejor calidad
    });
    
    const link = document.createElement('a');
    link.download = 'diseno-pro.png';
    link.href = dataURL;
    link.click();
}



/**
 * Ajusta la imagen de fondo actual para que siempre cubra el área del canvas.
 * Previene el bug de "recorte" al redimensionar la ventana.
 */
export function resizeBackground() {
    const bgImage = canvas.backgroundImage;
    if (bgImage) {
        const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
        canvas.setBackgroundImage(bgImage, canvas.renderAll.bind(canvas), {
            scaleX: scale,
            scaleY: scale,
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center'
        });
    }
}
