// ========================================
// LÓGICA DE INICIO DE SESIÓN - FÉNIX LÁSER
// ========================================

// PASO 1: Seleccionar elementos del DOM
// Fórmula: elemento = document.getElementById(id)
const formulario = document.getElementById('inicioSesionForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnIniciarSesion = document.getElementById('btnIniciarSesion');
const mensajeError = document.getElementById('mensajeError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// ========================================
// CONFIGURACIÓN
// ========================================

// URL del backend (cambiar según tu ambiente)
const URL_BACKEND = 'http://localhost:8080/api/v1';
const ENDPOINT_LOGIN = '/auth/login';

// ========================================
// FUNCIÓN 1: VALIDAR EMAIL
// ========================================

/**
 * Fórmula: validarEmail(email) → Boolean
 * 
 * Validación matemática:
 * email ∈ {cadenas que cumplan el patrón regex}
 * 
 * Patrón: usuario@dominio.extensión
 * Ejemplo válido: juan@gmail.com
 * Ejemplo inválido: juangmail.com (sin @)
 */
function validarEmail(email) {
    // Expresión regular: patrón que debe cumplir el email
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Retorna true si cumple, false si no
    return patronEmail.test(email);
}

// ========================================
// FUNCIÓN 2: VALIDAR CONTRASEÑA
// ========================================

/**
 * Fórmula: validarPassword(password) → Boolean
 * 
 * Requisitos:
 * longitud(password) >= 6
 */
function validarPassword(password) {
    return password.length >= 6;
}

// ========================================
// FUNCIÓN 3: LIMPIAR ERRORES
// ========================================

/**
 * Fórmula: limpiarErrores() → void
 * 
 * Quita todos los mensajes de error de la pantalla
 */
function limpiarErrores() {
    mensajeError.classList.add('d-none');
    emailError.classList.add('d-none');
    passwordError.classList.add('d-none');
    mensajeError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
}

// ========================================
// FUNCIÓN 4: MOSTRAR ERROR
// ========================================

/**
 * Fórmula: mostrarError(tipo, mensaje) → void
 * 
 * tipo ∈ {email, password, general}
 */
function mostrarError(tipo, mensaje) {
    if (tipo === 'email') {
        emailError.textContent = mensaje;
        emailError.classList.remove('d-none');
    } else if (tipo === 'password') {
        passwordError.textContent = mensaje;
        passwordError.classList.remove('d-none');
    } else if (tipo === 'general') {
        mensajeError.textContent = mensaje;
        mensajeError.classList.remove('d-none');
    }
}

// ========================================
// FUNCIÓN 5: VALIDAR FORMULARIO
// ========================================

/**
 * Fórmula: validarFormulario() → {valido: Boolean, errores: Object}
 * 
 * Comprueba:
 * ├─ ¿Email existe? SI/NO
 * ├─ ¿Email es válido? SI/NO
 * ├─ ¿Password existe? SI/NO
 * └─ ¿Password >= 6 caracteres? SI/NO
 */
function validarFormulario() {
    limpiarErrores();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let valido = true;
    
    // Validación 1: ¿Existe el email?
    if (!email) {
        mostrarError('email', 'Por favor, ingresa tu correo electrónico');
        valido = false;
    } 
    // Validación 2: ¿Formato de email es válido?
    else if (!validarEmail(email)) {
        mostrarError('email', 'El correo electrónico no es válido');
        valido = false;
    }
    
    // Validación 3: ¿Existe la contraseña?
    if (!password) {
        mostrarError('password', 'Por favor, ingresa tu contraseña');
        valido = false;
    } 
    // Validación 4: ¿Contraseña >= 6 caracteres?
    else if (!validarPassword(password)) {
        mostrarError('password', 'La contraseña debe tener al menos 6 caracteres');
        valido = false;
    }
    
    return valido;
}

// ========================================
// FUNCIÓN 6: DESACTIVAR BOTÓN (MIENTRAS CARGA)
// ========================================

/**
 * Fórmula: actualizarBoton(estado) → void
 * 
 * estado ∈ {cargando, normal}
 * 
 * Si estado = cargando:
 *   - Mostrar spinner
 *   - Desactivar botón
 * Si estado = normal:
 *   - Quitar spinner
 *   - Activar botón
 */
function actualizarBoton(cargando) {
    if (cargando) {
        btnIniciarSesion.disabled = true;
        btnIniciarSesion.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Iniciando sesión...
        `;
    } else {
        btnIniciarSesion.disabled = false;
        btnIniciarSesion.innerHTML = 'Iniciar sesión';
    }
}

// ========================================
// FUNCIÓN 7: GUARDAR DATOS DEL USUARIO
// ========================================

/**
 * Fórmula: guardarDatosUsuario(datos) → void
 * 
 * localStorage[token] = datos.token
 * localStorage[usuario] = JSON.stringify(datos.usuario)
 * 
 * Matemáticamente:
 * almacenamiento_local = {
 *   token: datos.token,
 *   usuario: datos.usuario
 * }
 */
function guardarDatosUsuario(datos) {
    try {
        // Guardar el token (necesario para futuras peticiones)
        localStorage.setItem('token', datos.token);
        
        // Guardar información del usuario
        localStorage.setItem('usuario', JSON.stringify(datos.usuario));
        
        // Guardar que está autenticado
        localStorage.setItem('autenticado', 'true');
        
        console.log('Datos guardados en localStorage');
    } catch (error) {
        console.error('Error al guardar datos:', error);
    }
}

// ========================================
// FUNCIÓN 8: REALIZAR LOGIN (MAIN FUNCTION)
// ========================================

/**
 * Fórmula: realizarLogin(email, password) → Promise
 * 
 * POST /auth/login
 * {
 *   email: email,
 *   password: password
 * }
 * 
 * Respuesta esperada:
 * {
 *   token: "eyJhbGc...",
 *   usuario: {
 *     id: 1,
 *     nombre: "Juan",
 *     email: "juan@gmail.com"
 *   }
 * }
 */
async function realizarLogin(email, password) {
    try {
        actualizarBoton(true);
        limpiarErrores();
        
        // PASO 1: Construir la solicitud
        const solicitud = {
            email: email,
            password: password
        };
        
        console.log('Enviando solicitud:', solicitud);
        
        // PASO 2: Hacer la petición al backend
        const respuesta = await fetch(`${URL_BACKEND}${ENDPOINT_LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(solicitud)
        });
        
        // PASO 3: Convertir respuesta a JSON
        const datos = await respuesta.json();
        
        console.log(' Respuesta del servidor:', datos);
        
        // PASO 4: Verificar si fue exitoso
        if (!respuesta.ok) {
            // Error del servidor
            throw new Error(datos.mensaje || 'Error al iniciar sesión');
        }
        
        // PASO 5: Guardar datos en localStorage
        guardarDatosUsuario(datos);
        
        // PASO 6: Mostrar éxito
        console.log('Inicio de sesión exitoso');
        
        // PASO 7: Redirigir al dashboard/home
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
        
    } catch (error) {
        // Error en la petición
        console.error('Error:', error);
        mostrarError('general', error.message || 'No se pudo conectar al servidor');
        actualizarBoton(false);
    }
}

// ========================================
// FUNCIÓN 9: MANEJAR ENVÍO DEL FORMULARIO
// ========================================

/**
 * Fórmula: manejarEnvío(evento) → void
 * 
 * Flujo:
 * 1. Prevenir comportamiento por defecto del formulario
 * 2. Validar datos
 * 3. SI válido: llamar realizarLogin()
 * 4. SINO: mostrar errores
 */
function manejarEnvio(evento) {
    // PASO 1: Prevenir que recargue la página
    evento.preventDefault();
    
    console.log('Formulario enviado');
    
    // PASO 2: Validar datos
    if (!validarFormulario()) {
        console.log('Validación fallida');
        return;
    }
    
    // PASO 3: Obtener valores
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    console.log('Validación exitosa, intentando login...');
    
    // PASO 4: Realizar login
    realizarLogin(email, password);
}

// ========================================
// EVENT LISTENERS
// ========================================

// Escuchar cuando se envía el formulario
formulario.addEventListener('submit', manejarEnvio);

// Limpiar error de email cuando empieza a escribir
emailInput.addEventListener('input', () => {
    emailError.classList.add('d-none');
});

// Limpiar error de password cuando empieza a escribir
passwordInput.addEventListener('input', () => {
    passwordError.classList.add('d-none');
});

// ========================================
// VALIDACIÓN AL CARGAR LA PÁGINA
// ========================================

/**
 * Fórmula: verificarSesiónExistente() → void
 * 
 * SI usuario ya está autenticado:
 *   Redirigir a dashboard
 * SINO:
 *   Permitir acceso a login
 */
document.addEventListener('DOMContentLoaded', () => {
    const autenticado = localStorage.getItem('autenticado');
    
    if (autenticado === 'true') {
        console.log('Usuario ya autenticado, redirigiendo...');
        window.location.href = '/index.html';
    }
});

console.log(' Script de inicio de sesión cargado correctamente');