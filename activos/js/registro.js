// =============================================
//  FUNCIÓN GENÉRICA DE NOTIFICACIÓN (SweetAlert2)
// =============================================
function notificar(titulo, mensaje, icono) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono
    });
}

// =============================================
//  MOSTRAR ERROR EN UN CAMPO
// =============================================
function mostrarError(id, mensaje) {
    const elemento = document.getElementById(id);
    elemento.classList.add('is-invalid');

    // Construye el id del div de error: ej. "nombre" -> "errorNombre"
    const errorDivId = 'error' + id.charAt(0).toUpperCase() + id.slice(1);
    const errorDiv = document.getElementById(errorDivId);
    if (errorDiv) {
        errorDiv.innerText = mensaje;
    }
}

// =============================================
//  LIMPIAR FORMULARIO Y ESTILOS DE ERROR
// =============================================
function limpiarFormulario() {
    const formulario = document.getElementById('registroForm');

    // 1. Limpia los valores de todos los inputs
    formulario.reset();

    // 2. Elimina las clases de error (is-invalid)
    const inputs = formulario.querySelectorAll('.form-control');
    inputs.forEach(input => input.classList.remove('is-invalid'));
}

// =============================================
//  DESHABILITAR / HABILITAR BOTÓN DE SUBMIT
//  (evita múltiples clicks mientras se procesa)
// =============================================
function setBotonCargando(cargando) {
    const boton = document.querySelector('#registroForm button[type="submit"]');
    if (!boton) return;

    if (cargando) {
        boton.disabled = true;
        boton.dataset.textoOriginal = boton.innerText;
        boton.innerText = 'Registrando...';
    } else {
        boton.disabled = false;
        boton.innerText = boton.dataset.textoOriginal || 'Registrarse';
    }
}

// =============================================
//  EVENTO SUBMIT DEL FORMULARIO
// =============================================
document.getElementById('registroForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // --- Limpiar estados previos de validación ---
    const inputs = this.querySelectorAll('.form-control');
    inputs.forEach(input => input.classList.remove('is-invalid'));

    let esValido = true;

    // --- Obtener valores ---
    const nombre          = document.getElementById('nombre').value.trim();
    const telefono        = document.getElementById('telefono').value.trim();
    const email           = document.getElementById('email').value.trim();
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // --- VALIDACIONES ---
    if (nombre.length < 3) {
        mostrarError('nombre', 'Por favor, ingresa tu nombre completo.');
        esValido = false;
    }

    const telReg = /^\d{10}$/;
    if (!telReg.test(telefono)) {
        mostrarError('telefono', 'Ingresa un número de teléfono válido (10 dígitos).');
        esValido = false;
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
        mostrarError('email', 'Ingresa un correo electrónico válido.');
        esValido = false;
    }

    if (password.length < 6) {
        mostrarError('password', 'La contraseña debe tener al menos 6 caracteres.');
        esValido = false;
    }

    if (confirmPassword === '' || password !== confirmPassword) {
        mostrarError('confirmPassword', 'Las contraseñas no coinciden.');
        esValido = false;
    }

    // --- Si hay errores, detener aquí ---
    if (!esValido) return;

    // --- CREACIÓN DEL OBJETO DE DATOS ---
    const usuarioData = {
        nombre:    nombre,     
        correo:    email,      
        telefono:  telefono,
        password:  password,
        fecha_registro:   new Date().toISOString()  // Fecha automática en formato ISO 8601
    };

    // console.log('Objeto JSON a enviar:', JSON.stringify(usuarioData));

    // --- LLAMADA A LA API ---
    // ⚠️ Hay que cambiar esta URL según el entorno (desarrollo / producción)
    const url = 'http://localhost:8080/api/v1/new-user/';

    // Deshabilitar botón mientras se procesa la petición
    setBotonCargando(true);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioData)
        });

        // Validar que el servidor respondió con un status OK (200-299)
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const mensajeError = errorData?.message || `Error del servidor: ${response.status}`;
            throw new Error(mensajeError);
        }

        const data = await response.json();
        // console.log('Usuario guardado correctamente:', data);

        // Solo limpiar y notificar éxito si el servidor confirmó la operación
        limpiarFormulario();
        notificar('¡Registro exitoso!', 'Ahora eres parte de Fenix Laser', 'success');

    } catch (error) {
        // Notificar al usuario si hubo un error de red o del servidor
       // console.error('Error al registrar usuario:', error);
        notificar(
            'Error al registrar',
            error.message || 'Hubo un problema al conectar con el servidor. Intenta de nuevo.',
            'error'
        );
    } finally {
        // Siempre rehabilitar el botón al terminar, sin importar el resultado
        setBotonCargando(false);
    }
});