// contactanos.js

const form = document.getElementById("contactForm");
const btnSend = document.getElementById("btn-submit");

// Configuración de Toast para ERRORES (arriba-derecha, no modal)
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const showErrorToast = (title, text = "") => {
  Toast.fire({
    icon: "error",
    title,
    text,
    iconColor: "#C62828",           // --red
    color: "#ffffff",
    background: "rgba(198, 40, 40, 0.18)",
  });
};

const showSuccessModal = () => {
  Swal.fire({
    title: "¡Registro exitoso!",
    html: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="
          width: 90px; 
          height: 90px; 
          margin: 0 auto 25px; 
          border-radius: 50%; 
          border: 5px solid #28a745; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 60px; 
          color: #28a745;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.15);
        ">
          ✓
        </div>
        <p style="color: #000000; font-size: 1.4rem; font-weight: 700; margin: 0 0 12px;">
          ¡Registro exitoso!
        </p>
        <p style="color: #333333; font-size: 1.05rem; margin: 0;">
          Ahora eres parte de Fenix Laser
        </p>
      </div>
    `,
    icon: "none",
    showConfirmButton: true,
    confirmButtonText: "OK",
    confirmButtonColor: "#6f42c1",      // morado/azul como en tu imagen (puedes cambiar por #5a3ea8 o el hex exacto)
    background: "#ffffff",              // fondo completamente blanco
    color: "#000000",
    backdrop: "rgba(0,0,0,0.55)",       // fondo oscuro semi-transparente para destacar el modal blanco
    customClass: {
      popup: "custom-success-modal-white",
      confirmButton: "custom-ok-btn-white"
    },
    padding: "2.8rem 2rem",
    width: "420px",                     // ancho similar al de tu captura
  });
};

// Validaciones helpers
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizePhone = (phone) => phone.replace(/[^\d+]/g, "");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const endpoint = form.action;
  if (!endpoint) {
    showErrorToast("Error de configuración", "Falta el endpoint.");
    return;
  }

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();

  if (fullName.length < 3) {
    showErrorToast("Nombre incompleto", "Escribe tu nombre completo (mínimo 3 caracteres).");
    return;
  }

  if (!isValidEmail(email)) {
    showErrorToast("Correo inválido", "Escribe un correo válido.");
    return;
  }

  const cleanPhone = normalizePhone(phone);
  if (cleanPhone.length < 10) {
    showErrorToast("Teléfono inválido", "Escribe un teléfono válido con lada (mínimo 10 dígitos).");
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
      showSuccessModal();
      form.reset();
    } else {
      const msg = data?.errors?.[0]?.message || "No se pudo enviar. Intenta de nuevo.";
      showErrorToast("Error al enviar", msg);
    }
  } catch (err) {
    showErrorToast("Error de conexión", "Revisa tu internet.");
  } finally {
    btnSend.disabled = false;
    btnSend.textContent = "Enviar Mensaje";
  }
});