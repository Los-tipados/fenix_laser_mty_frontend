/*
 * Script para animaciones de entrada (Fade Up)
 */

document.addEventListener('DOMContentLoaded', () => {
    const elementos = document.querySelectorAll('.fade-up');

    // Definimos si es móvil
    const isMobile = window.innerWidth < 768;

    // Ajustamos el umbral: 
    // En PC esperamos al 40% del elemento, en móvil al 20% para que se vea más rápido
    const umbralDinamico = isMobile ? 0.2 : 0.4;

    const observerOptions = {
        threshold: umbralDinamico
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    // Solo activamos el observador si NO es móvil 
    // o simplemente lo usamos para aplicar el umbral dinámico:
    elementos.forEach(el => observer.observe(el));
});

// Barra de navegación