document.getElementById('btnVerificar').addEventListener('click', async () => {
    
    const correo = document.getElementById('correoInput').value;

    if (!correo) {
        alert("Por favor, ingresa un correo.");
        return;
    }

    try {
        const respuesta = await fetch(`http://localhost:8080/api/v1/auth/check-email?correo=${correo}`);
        
        // --- AQUÍ EL CAMBIO CLAVE ---
        // 'data' ahora es el objeto { "exists": true } que manda tu Java
        const data = await respuesta.json(); 

        if (data.exists) { // Usamos .exists porque es la llave del Map
            alert("Usuario encontrado. Ahora puedes cambiar tu contraseña.");
            
            // Aquí es donde harías "aparecer" el resto del formulario
            // Ejemplo: document.getElementById('seccionNuevaPassword').style.display = 'block';
            
        } else {
            alert("El correo no está registrado.");
        }
    } catch (error) {
        console.error("Error al conectar con el servidor", error);
    }
});