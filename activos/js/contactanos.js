const form = document.getElementById("contactForm");
const alertBox = document.getElementById("formAlert");
const btnSend = document.getElementById("btn-submit");

function showAlert(message, type = "ok") {
  alertBox.textContent = message;
  alertBox.style.color = type === "ok" ? "#1F1C2D" : "#b00020";
  alertBox.style.background = type === "ok" ? "rgba(242,162,58,0.25)" : "rgba(255,107,107,0.18)";
  alertBox.style.border = type === "ok" ? "1px solid rgba(242,162,58,0.28)" : "1px solid rgba(255,107,107,0.28)";
  alertBox.style.padding = "10px 12px";
  alertBox.style.borderRadius = "10px";
}

function clearAlert() {
  alertBox.textContent = "";
  alertBox.removeAttribute("style");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(phone) {
  return phone.replace(/[^\d+]/g, "");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAlert();

  const endpoint = form.action; // https://formspree.io/f/mlggeqbj
  if (!endpoint) {
    showAlert("Falta configurar el endpoint de Formspree.", "error");
    return;
  }

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();


  if (fullName.length < 3) {
    showAlert("Por favor escribe tu nombre completo (mínimo 3 caracteres).", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showAlert("Por favor escribe un correo válido (ej: nombre@correo.com).", "error");
    return;
  }

  const cleanPhone = normalizePhone(phone);
  if (cleanPhone.length < 10) {
    showAlert("Por favor escribe un teléfono válido con lada (mínimo 10 dígitos).", "error");
    return;
  }

  try {
    btnSend.disabled = true;
    btnSend.textContent = "Enviando...";

    const formData = new FormData(form);

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      showAlert("¡Mensaje enviado! Te contactaremos pronto ", "ok");
      form.reset();
    } else {
      const msg =
        data?.errors?.[0]?.message ||
        "No se pudo enviar. Intenta de nuevo en unos minutos.";
      showAlert(msg, "error");
    }
  } catch (err) {
    showAlert("Error de red. Revisa tu conexión e intenta otra vez.", "error");
  } finally {
    btnSend.disabled = false;
    btnSend.textContent = "Enviar Mensaje";
  }
});