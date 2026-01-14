(() => {
    const form = document.getElementById("contactForm");
    const statusEl = document.getElementById("formStatus");

    if (!form) return;

    const isValidName = (v) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,}$/.test(v.trim());
    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    const isValidPhone = (v) => {
        const digits = v.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
    };
    const isValidMessage = (v) => v.trim().length >= 10;

    const fields = {
        nombre: { test: isValidName, msg: "Ingresa tu nombre (mínimo 2 letras)." },
        email: { test: isValidEmail, msg: "Ingresa un correo electrónico válido." },
        telefono: { test: isValidPhone, msg: "Ingresa un número de teléfono válido (10-15 dígitos)." },
        mensaje: { test: isValidMessage, msg: "El mensaje debe tener al menos 10 caracteres." },
    };

})