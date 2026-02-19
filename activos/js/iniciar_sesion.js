// ========================================
// LÓGICA DE INICIO DE SESIÓN - FÉNIX LÁSER
// ========================================

// PASO 1: Seleccionar elementos del DOM
const formulario       = document.getElementById('inicioSesionForm');
const emailInput       = document.getElementById('email');
const passwordInput    = document.getElementById('password');
const btnIniciarSesion = document.getElementById('btnIniciarSesion');
const mensajeError     = document.getElementById('mensajeError');
const emailError       = document.getElementById('emailError');
const passwordError    = document.getElementById('passwordError');

// ========================================
// CONFIGURACIÓN
// ========================================
const URL_BACKEND = 'http://localhost:8080/api/v1/auth/login';

// ========================================
// FUNCIÓN 1: VALIDAR EMAIL
// ========================================
function validarEmail(email) {
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patronEmail.test(email);
}

// ========================================
// FUNCIÓN 2: VALIDAR CONTRASEÑA
// ========================================
function validarPassword(password) {
    return password.length >= 6;
}

// ========================================
// FUNCIÓN 3: LIMPIAR ERRORES
// ========================================
function limpiarErrores() {
    mensajeError.classList.add('d-none');
    emailError.classList.add('d-none');
    passwordError.classList.add('d-none');
    mensajeError.textContent  = '';
    emailError.textContent    = '';
    passwordError.textContent = '';
}

// ========================================
// FUNCIÓN 4: MOSTRAR ERROR
// ========================================
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
function validarFormulario() {
    limpiarErrores();

    const email    = emailInput.value.trim();
    const password = passwordInput.value;
    let valido     = true;

    if (!email) {
        mostrarError('email', 'Por favor, ingresa tu correo electrónico');
        valido = false;
    } else if (!validarEmail(email)) {
        mostrarError('email', 'El correo electrónico no es válido');
        valido = false;
    }

    if (!password) {
        mostrarError('password', 'Por favor, ingresa tu contraseña');
        valido = false;
    } else if (!validarPassword(password)) {
        mostrarError('password', 'La contraseña debe tener al menos 6 caracteres');
        valido = false;
    }

    return valido;
}

// ========================================
// FUNCIÓN 6: ACTUALIZAR BOTÓN (CARGA)
// ========================================
function actualizarBoton(cargando) {
    if (cargando) {
        btnIniciarSesion.disabled  = true;
        btnIniciarSesion.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Iniciando sesión...
        `;
    } else {
        btnIniciarSesion.disabled  = false;
        btnIniciarSesion.innerHTML = 'Iniciar sesión';
    }
}

// ========================================
// FUNCIÓN 7: GUARDAR DATOS DEL USUARIO
// ========================================

// ✅ Ajustado a la respuesta real de LoginResponse del backend
// { idUsuario, nombre, correo, rol, autenticado }
function guardarDatosUsuario(datos) {
    localStorage.setItem('autenticado', 'true');
    localStorage.setItem('usuario', JSON.stringify({
        id:     datos.idUsuario,
        nombre: datos.nombre,
        correo: datos.correo,
        rol:    datos.rol
    }));
}

// ========================================
// FUNCIÓN 8: REALIZAR LOGIN
// ========================================
async function realizarLogin(email, password) {
    actualizarBoton(true);
    limpiarErrores();

    try {
        // ✅ Campo renombrado de "email" a "correo" para coincidir con LoginRequest del backend
        const solicitud = {
            correo:   email,
            password: password
        };

        const respuesta = await fetch(URL_BACKEND, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(solicitud)
        });

        // ✅ El backend devuelve String plano en errores (no JSON), por eso usamos .text()
        if (!respuesta.ok) {
            const mensajeServidor = await respuesta.text();

            if (respuesta.status === 404) {
                mostrarError('email', 'No existe ninguna cuenta con ese correo.');
            } else if (respuesta.status === 401) {
                mostrarError('password', 'La contraseña es incorrecta.');
            } else {
                mostrarError('general', mensajeServidor || `Error del servidor: ${respuesta.status}`);
            }

            actualizarBoton(false);
            return;
        }

        const datos = await respuesta.json();

        // Guardar sesión y redirigir
        guardarDatosUsuario(datos);

        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);

    } catch (error) {
        mostrarError('general', 'No se pudo conectar al servidor. Intenta de nuevo.');
        actualizarBoton(false);
    }
}

// ========================================
// FUNCIÓN 9: MANEJAR ENVÍO DEL FORMULARIO
// ========================================
function manejarEnvio(evento) {
    evento.preventDefault();

    if (!validarFormulario()) return;

    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    realizarLogin(email, password);
}

// ========================================
// EVENT LISTENERS
// ========================================
formulario.addEventListener('submit', manejarEnvio);

emailInput.addEventListener('input',    () => emailError.classList.add('d-none'));
passwordInput.addEventListener('input', () => passwordError.classList.add('d-none'));

// ========================================
// VERIFICAR SESIÓN AL CARGAR LA PÁGINA
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('autenticado') === 'true') {
        window.location.href = '/index.html';
    }
});