const faqData = {
  about: [
    {
      q: "¿Quiénes somos?",
      a: "Somos Fénix Láser, una empresa dedicada al grabado láser en distintos materiales."
    },
    {
      q: "¿Qué servicios ofrecemos?",
      a: "Grabado láser, corte y personalización de productos."
    }
  ],
  materials: [
    {
      q: "¿Qué materiales trabajan?",
      a: "Madera, acrílico, vidrio, cuero sintético y más."
    }
  ],
  user: [
    {
      q: "¿Puedo pedir un diseño personalizado?",
      a: "Sí, puedes enviarnos tu idea o diseño."
    }
  ],
  shipping: [
    {
      q: "¿Hacen envíos a todo México?",
      a: "Sí, enviamos a todo México."
    }
  ]
};

const accordion = document.getElementById("faqAccordion");
const sectionTitle = document.getElementById("faqSectionTitle");
const categoryButtons = document.querySelectorAll(".cat");
const searchInput = document.getElementById("faqSearch");

function getCategoryLabel(category) {
  const btn = document.querySelector(`.cat[data-category="${category}"] span`);
  return btn ? btn.textContent : "";
}

function renderFAQs(category, filter = "") {
  accordion.innerHTML = "";

  // título del panel
  sectionTitle.textContent = getCategoryLabel(category);

  const list = (faqData[category] || [])
    .filter(item => item.q.toLowerCase().includes(filter));

  // Si no hay resultados, muestra un mensaje
  if (list.length === 0) {
    accordion.innerHTML = `
      <div class="faq-item">
        <div class="faq-question">
          <span class="icon">+</span> No encontramos resultados
        </div>
        <div class="faq-answer">Intenta con otra palabra o cambia de categoría.</div>
      </div>
    `;
    return;
  }

  list.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("faq-item");

    div.innerHTML = `
      <div class="faq-question">
        <span class="icon">+</span> ${item.q}
      </div>
      <div class="faq-answer">${item.a}</div>
    `;

    const question = div.querySelector(".faq-question");
    const icon = div.querySelector(".icon");

    question.addEventListener("click", () => {
      div.classList.toggle("open");
      icon.textContent = div.classList.contains("open") ? "–" : "+";
    });

    accordion.appendChild(div);
  });
}

// clicks en categorías
categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    categoryButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    searchInput.value = "";
    renderFAQs(btn.dataset.category);
  });
});

// buscador
searchInput.addEventListener("input", e => {
  const activeCategory = document.querySelector(".cat.active")?.dataset.category || "about";
  renderFAQs(activeCategory, e.target.value.toLowerCase());
});

// Inicial
renderFAQs("about");