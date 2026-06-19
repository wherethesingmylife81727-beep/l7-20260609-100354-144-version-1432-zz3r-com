(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => showHero(dotIndex));
  });

  if (slides.length > 1) {
    showHero(0);
    window.setInterval(() => showHero(heroIndex + 1), 5200);
  }

  const listSearchInputs = Array.from(document.querySelectorAll('[data-card-search]'));
  listSearchInputs.forEach((input) => {
    const scopeSelector = input.getAttribute('data-card-search');
    const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    const cards = scope ? Array.from(scope.querySelectorAll('[data-search]')) : [];
    const counterSelector = input.getAttribute('data-counter');
    const counter = counterSelector ? document.querySelector(counterSelector) : null;
    const emptySelector = input.getAttribute('data-empty');
    const empty = emptySelector ? document.querySelector(emptySelector) : null;

    const run = () => {
      const keyword = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const haystack = card.getAttribute('data-search') || '';
        const matched = !keyword || haystack.includes(keyword);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = String(visible);
      }
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    input.addEventListener('input', run);
    run();
  });

  const filterForms = Array.from(document.querySelectorAll('[data-filter-form]'));
  filterForms.forEach((form) => {
    const scopeSelector = form.getAttribute('data-filter-form');
    const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    const cards = scope ? Array.from(scope.querySelectorAll('[data-search]')) : [];
    const keyword = form.querySelector('[name="keyword"]');
    const year = form.querySelector('[name="year"]');
    const category = form.querySelector('[name="category"]');
    const counter = document.querySelector(form.getAttribute('data-counter') || '');
    const empty = document.querySelector(form.getAttribute('data-empty') || '');

    const run = () => {
      const keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
      const yearValue = year ? year.value : '';
      const categoryValue = category ? category.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = card.getAttribute('data-search') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const cardCategory = card.getAttribute('data-category') || '';
        const matchedKeyword = !keywordValue || haystack.includes(keywordValue);
        const matchedYear = !yearValue || cardYear === yearValue;
        const matchedCategory = !categoryValue || cardCategory === categoryValue;
        const matched = matchedKeyword && matchedYear && matchedCategory;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = String(visible);
      }
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    form.addEventListener('input', run);
    form.addEventListener('change', run);
    form.addEventListener('submit', (event) => event.preventDefault());
    run();
  });
})();
