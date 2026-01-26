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

    // Validación de Nombre
    if (nombre.length < 3) {
        mostrarError('nombre', 'Por favor, ingresa tu nombre completo.');
        esValido = false;
    }

    // Validación de Teléfono (Ejemplo 10 dígitos)
    const telReg = /^\d{10}$/;
    if (!telReg.test(telefono)) {
        mostrarError('telefono', 'Ingresa un número de teléfono válido (10 dígitos).');
        esValido = false;
    }

    // Validación de Email
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
        mostrarError('email', 'Ingresa un correo electrónico válido.');
        esValido = false;
    }

    // Validación de Password
    if (password.length < 6) {
        mostrarError('password', 'La contraseña debe tener al menos 6 caracteres.');
        esValido = false;
    }

    // Validación Coincidencia Password
    if (password !== confirmPassword || confirmPassword === "") {
        mostrarError('confirmPassword', 'Las contraseñas no coinciden.');
        esValido = false;
    }

    if (esValido) {
        alert("¡Registro exitoso!");
        // Aquí iría tu lógica de envío al servidor
    }
});

function mostrarError(id, mensaje) {
    const elemento = document.getElementById(id);
    elemento.classList.add('is-invalid');
    document.getElementById('error' + id.charAt(0).toUpperCase() + id.slice(1)).innerText = mensaje;
}