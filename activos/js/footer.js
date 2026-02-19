// load-footer.js
document.addEventListener('DOMContentLoaded', () => {
  const footerContainer = document.getElementById('footer-container');

  if (!footerContainer) {
    console.warn('No se encontró el elemento #footer-container en la página');
    return;
  }

  footerContainer.classList.add('footer-loading');

  fetch('/paginas/footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al cargar footer.html: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(html => {
      footerContainer.innerHTML = html;

      // Normalizaciones DOM/CSS
      footerContainer.classList.remove('footer-loading');
      footerContainer.classList.add('footer-injected');
      footerContainer.style.overflow = 'auto';

      // Esperar medios
      const imgs = [...footerContainer.querySelectorAll('img')];
      const videos = [...footerContainer.querySelectorAll('video')];
      const media = imgs.concat(videos);

      const waitForMedia = media.map(m => {
        if (m.tagName === 'IMG') {
          if (m.complete) return Promise.resolve();
          return new Promise(res => {
            m.addEventListener('load', res);
            m.addEventListener('error', res);
          });
        } else {
          if (m.readyState >= 1) return Promise.resolve();
          return new Promise(res => {
            m.addEventListener('loadedmetadata', res);
            m.addEventListener('error', res);
          });
        }
      });

      const fontsReady =
        document.fonts && document.fonts.ready
          ? document.fonts.ready
          : Promise.resolve();

      return Promise.all([fontsReady, Promise.all(waitForMedia)]);
    })
    .then(() => {
      const rect = footerContainer.getBoundingClientRect();
      const offset = footerContainer.offsetHeight;
      const computed = getComputedStyle(footerContainer).height;

      footerContainer.dataset.debugRect = rect.height;
      footerContainer.dataset.debugOffset = offset;
      footerContainer.dataset.debugComputed = computed;

      if (
        location.hostname === 'localhost' ||
        location.hostname.endsWith('.local') ||
        location.search.includes('debugFooter')
      ) {
        console.info('[footer] medidas finales:', {
          rect: rect.height,
          offset,
          computed
        });
      }
    })
    .catch(error => {
      console.error('No se pudo cargar el footer:', error);
      footerContainer.classList.remove('footer-loading');
      footerContainer.innerHTML = `
        <div class="alert alert-danger text-center m-4">
          No se pudo cargar el pie de página.<br>
          <small>Error: ${error.message}</small>
        </div>
      `;
    });
});
