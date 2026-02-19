// Tu función de notificación
function notificar(titulo, mensaje, icono) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono
    });
}

document.getElementById('btnVerificar').addEventListener('click', async () => {
    
    const correo = document.getElementById('correoInput').value;

    // 1. Validación de que no esté vacío
    if (!correo) {
        notificar("Campo vacío", "Por favor, ingresa un correo.", "warning");
        return;
    }

    // 2. Validación simple de formato (que tenga @)
    if (!correo.includes('@')) {
        notificar("Formato incorrecto", "El correo debe incluir un '@'.", "warning");
        return;
    }

    try {
        const respuesta = await fetch(`http://localhost:8080/api/v1/auth/check-email?correo=${correo}`);
        
        // Obtenemos el objeto { "exists": true/false }
        const data = await respuesta.json(); 

        if (data.exists) { 
            notificar("¡Usuario encontrado!", "Ahora puedes cambiar tu contraseña.", "success");
            
            // Aquí puedes mostrar el siguiente div si lo tienes
            // document.getElementById('seccionPassword').style.display = 'block';
            
        } else {
            notificar("No encontrado", "El correo no está registrado.", "error");
        }
    } catch (error) {
        console.error("Error al conectar con el servidor", error);
        notificar("Error", "No se pudo conectar con el servidor.", "error");
    }
});