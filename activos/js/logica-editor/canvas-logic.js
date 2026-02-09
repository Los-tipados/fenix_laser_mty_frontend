

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
 * Cambia la familia tipográfica asegurando que la fuente esté cargada
 * antes de renderizar para evitar fallos visuales en el canvas.
 * @param {string} font - Nombre de la fuente (ej. 'Bungee').
 */
export async function changeFont(font) {
    const obj = canvas.getActiveObject();
    
    // 1. Verificamos que el objeto sea de tipo texto
    if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        
        try {
            // 2. FORZADO: Esperamos a que el navegador tenga la fuente lista
            // '1em' es el tamaño base para la comprobación
            if (document.fonts) {
                await document.fonts.load(`1em "${font}"`);
            }

            // 3. Una vez confirmada la carga, aplicamos y renderizamos
            obj.set('fontFamily', font);
            canvas.renderAll();
            
            console.log(`Fuente aplicada: ${font}`);
        } catch (error) {
            console.error(`Error al cargar la fuente ${font}:`, error);
            
            // Fallback: Aplicar de todos modos si la API falla
            obj.set('fontFamily', font);
            canvas.renderAll();
        }
    }
}

/**
 * Incrementa o decrementa el tamaño de fuente del objeto activo.
 * @param {number} delta - Píxeles a sumar (positivo) o restar (negativo).
 * @param {Function} [callbackUI] - Función opcional para actualizar indicadores en la UI.
 */
export function changeFontSize(delta, callbackUI) {
    const obj = canvas.getActiveObject();
    
    // Solo procedemos si hay un objeto con propiedad fontSize
    if (obj && obj.fontSize) {
        const MIN_SIZE = 8;   // Evita que el texto desaparezca
        const MAX_SIZE = 300; // Evita que el texto bloquee todo el canvas

        // Calculamos el nuevo tamaño sumando el delta
        let newSize = obj.fontSize + delta;

        // "Clamp": Forzamos que el tamaño esté entre 8 y 300
        // Math.max(8, ...) asegura que no sea menor a 8
        // Math.min(..., 300) asegura que no sea mayor a 300
        newSize = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newSize));

        // Aplicamos el cambio al objeto de Fabric.js
        obj.set('fontSize', newSize);
        
        // Es vital llamar a setCoords() para que los controles (la cajita) 
        // se ajusten al nuevo tamaño del texto
        obj.setCoords();
        
        canvas.renderAll();

        // Si existe un callback (como updateUI), lo ejecutamos
        if (callbackUI) callbackUI();
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
 * Ajusta la imagen de fondo actual para que siempre se adapte al tamaño del canvas.
 * Previene el bug de "imagen cortada" al cerrar el teclado o rotar la pantalla.
 */
export function resizeBackground() {
    const bgImage = canvas.backgroundImage;
    if (bgImage) {
        // 1. Detectamos si es móvil para decidir el tipo de ajuste
        const isMobile = window.innerWidth <= 768;

        /**
         * 2. Aplicamos la misma lógica que al cargar el producto:
         * Mobile (Math.min): Asegura que TODO el producto se vea (sin cortes).
         * Desktop (Math.max): Llena todo el espacio (estilo cover).
         */
        const scale = isMobile 
            ? Math.min(canvas.width / bgImage.width, canvas.height / bgImage.height)
            : Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
        
        canvas.setBackgroundImage(bgImage, canvas.renderAll.bind(canvas), {
            scaleX: scale,
            scaleY: scale,
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            // Importante: mantenemos el crossOrigin si lo usaste al cargar
            crossOrigin: 'anonymous' 
        });
    }
}