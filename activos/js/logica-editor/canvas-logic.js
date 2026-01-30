

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
    
    // Cálculo de dimensiones responsivas
    const availableWidth = container.clientWidth - 40;
    const availableHeight = container.clientHeight - 40;

    canvas = new fabric.Canvas('mainCanvas', {
        width: Math.min(availableWidth, 700),
        height: Math.min(availableHeight, 600),
        backgroundColor: '#36363600'
    });

    // Suscripción a eventos de Fabric.js para sincronizar con la UI externa
    canvas.on('selection:created', onSelection);
    canvas.on('selection:updated', onSelection);
    canvas.on('selection:cleared', onCleared);
}



/**
 * Establece una imagen como fondo del lienzo con escalado inteligente.
 * @param {string} url - Ruta o URL de la imagen de fondo.
 */
export function changeCanvasBackground(url) {
    if (!url) return;
    
    fabric.Image.fromURL(url, (img) => {
        // Algoritmo de escalado: 'Cover' (asegura que cubra todo el fondo)
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        
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
