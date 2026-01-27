
document.getElementById('registroForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Limpiar estados previos
    const inputs = this.querySelectorAll('.form-control');
    inputs.forEach(input => input.classList.remove('is-invalid'));
    
    let esValido = true;

    // Obtener valores
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
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

    if (password !== confirmPassword || confirmPassword === "") {
        mostrarError('confirmPassword', 'Las contraseñas no coinciden.');
        esValido = false;
    }

    // --- CREACIÓN DEL OBJETO JSON ---
    if (esValido) {
        // Creamos el objeto con la estructura deseada
        const usuarioData = {
            nombre_completo: nombre,
            telefono: telefono,
            email: email, // Este actúa como nombre de usuario
            password: password
        };

        // Convertimos el objeto a una cadena JSON (opcional, dependiendo de cómo lo envíes)
        const usuarioJSON = JSON.stringify(usuarioData);

        console.log("Objeto JSON creado con éxito:");
        console.log(usuarioJSON);

// --- LLAMADA A LA FUNCIÓN DE LIMPIEZA ---
        limpiarFormulario();

        alert("¡Registro exitoso! Los datos se han guardado en un objeto JSON.");
        
        // Aquí podrías usar fetch() para enviar usuarioJSON a tu servidor
    }
});

function mostrarError(id, mensaje) {
    const elemento = document.getElementById(id);
    elemento.classList.add('is-invalid');
    const errorDiv = document.getElementById('error' + id.charAt(0).toUpperCase() + id.slice(1));
    if (errorDiv) {
        errorDiv.innerText = mensaje;
    }
}



// Función para resetear los campos y quitar estilos de error
function limpiarFormulario() {
    const formulario = document.getElementById('registroForm');
    
    // 1. Borra el texto de todos los inputs
    formulario.reset();

    // 2. (Opcional) Elimina las clases de borde rojo (is-invalid) si quedaron algunas
    const inputs = formulario.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
    });
}