

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
