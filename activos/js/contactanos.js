(() => {
    const form = document.getElementById("contactForm");
    const statusEl = document.getElementById("formStatus");

    if (!form) return;

    //Reglas simples de validación
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

    const setValidMessage = (input, ok, msg) => {
        const feedback = input.parentElement?.querySelector(".invalid-feedback");
        if (!ok) {
            input.classList.add("is-invalid");
            input.classList.remove("is-valid");
            if (feedback && msg) feedback.textContent = msg;
            } else {
                input.classList.remove("is-invalid");
                input.classList.add("is-valid");
            }
    };
    
    Object.keys(fields).forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener("input", () => {
            const ok = fields[id].test(input.value);
            setValidity(input, ok, fields[id].msg);
            });
  });

  form.addEventListener("submit", async (e) => {
     e.preventDefault();
    statusEl.textContent = "";

    let allOk=true;

    Object.keys(fields).forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        const ok = fields[id].test(input.value);
        setValidity(input, ok, fields[id].msg);
        if (!ok) allOk = false;
         });

         if (!allOk) {
            statusEl.textContent = "Revisa los campos marcados antes de enviar.";
            return;
         }

         try {
            statusEl.textContent = "Enviando...";
            const data = new FormData(form);

            const res = await fetch(form.action, {
                 method: "POST",
                  body: data,
                  headers: { Accept: "application/json" },
                });

                if (res.ok) {
                    form.reset();

                    Object.keys(fields).forEach((id) => {
                        const input = document.getElementById(id);
                        if (input) input.classList.remove("is-valid", "is-invalid");
                        });
                        statusEl.textContent = "¡Listo! Tu mensaje fue enviado correctamente.";
                } else {
                    statusEl.textContent = "Ocurrió un error al enviar. Inténtalo de nuevo.";
                    }
                    } catch (err) {
                        statusEl.textContent = "No se pudo conectar. Revisa tu internet e inténtalo de nuevo.";
                    }
    });
})();