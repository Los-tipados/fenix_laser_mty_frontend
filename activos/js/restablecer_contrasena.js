// Tu función de notificación estándar
function notificar(titulo, mensaje, icono) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnActualizar = document.getElementById('btnActualizar');

    btnActualizar.addEventListener('click', async (event) => {
        event.preventDefault(); // Evita que el form se recargue

        // 1. Capturar valores
        const pass1 = document.getElementById('pass1').value;
        const pass2 = document.getElementById('pass2').value;
        
        // Recuperamos el correo que guardamos en la página anterior
        const correoGuardado = localStorage.getItem('emailUsuarioParaRecuperar');

        // 2. VALIDACIONES PREVIAS
        if (!correoGuardado) {
            notificar("Sesión expirada", "No se encontró un correo validado. Por favor, inicia el proceso de nuevo.", "error");
            return;
        }

        if (!pass1 || !pass2) {
            notificar("Campos incompletos", "Ambos campos de contraseña son obligatorios.", "warning");
            return;
        }

        // --- VALIDACIÓN DE LONGITUD (Mínimo 8 caracteres) ---
        if (pass1.length < 8) {
            notificar("Contraseña corta", "La contraseña debe tener al menos 8 caracteres por seguridad.", "warning");
            return;
        }

        // --- VALIDACIÓN DE IGUALDAD ---
        if (pass1 !== pass2) {
            notificar("No coinciden", "Las contraseñas no son iguales. Por favor, verifícalas.", "error");
            return;
        }

        // 3. LLAMADA A TU API (PUT)
        try {
            // Mostramos un mensaje de "Procesando..."
            Swal.showLoading();

            const respuesta = await fetch('http://localhost:8080/api/v1/auth/reset-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correo: correoGuardado,
                    password: pass1 // Enviamos la nueva contraseña confirmada
                })
            });

            Swal.close(); // Cerramos el loading

            if (respuesta.ok) {
                // Limpiamos el localStorage ya que el proceso terminó con éxito
                localStorage.removeItem('emailUsuarioParaRecuperar');

                Swal.fire({
                    title: "¡Contraseña actualizada!",
                    text: "Tu clave ha sido cambiada con éxito. Ya puedes iniciar sesión.",
                    icon: "success",
                    confirmButtonText: "Ir al Login"
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/paginas/iniciar_sesion.html";
                    }
                });
            } else {
                notificar("Error", "Hubo un problema al actualizar. Inténtalo más tarde.", "error");
            }

        } catch (error) {
            Swal.close();
            console.error("Error en el PUT:", error);
            notificar("Error de red", "No se pudo conectar con el servidor.", "error");
        }
    });
});