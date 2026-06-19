(() => {
  const form = document.querySelector('[data-global-search-form]');
  const input = document.querySelector('[data-global-search-input]');
  const results = document.querySelector('[data-global-search-results]');
  const count = document.querySelector('[data-global-search-count]');
  const empty = document.querySelector('[data-global-search-empty]');

  if (!form || !input || !results || !Array.isArray(window.__MOVIE_INDEX__)) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;

  function card(movie) {
    return `
      <article class="movie-card">
        <a class="poster-link" href="${movie.url}" aria-label="观看 ${movie.title}">
          <img class="poster-img" src="${movie.cover}" alt="${movie.title}" loading="lazy" onerror="this.classList.add('is-missing')">
          <span class="poster-badge">${movie.year}</span>
          <span class="poster-play">▶</span>
        </a>
        <div class="card-body">
          <div class="card-meta">
            <a href="${movie.categoryUrl}">${movie.category}</a>
            <span>${movie.region}</span>
          </div>
          <h3><a href="${movie.url}">${movie.title}</a></h3>
          <p>${movie.oneLine}</p>
          <div class="tag-row">${movie.tags.slice(0, 3).map((tag) => `<span>${tag}</span>`).join('')}</div>
        </div>
      </article>`;
  }

  function runSearch() {
    const query = input.value.trim().toLowerCase();
    const matches = window.__MOVIE_INDEX__.filter((movie) => {
      return !query || movie.search.includes(query);
    }).slice(0, 160);

    results.innerHTML = matches.map(card).join('');

    if (count) {
      count.textContent = String(matches.length);
    }
    if (empty) {
      empty.classList.toggle('is-visible', matches.length === 0);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set('q', input.value.trim());
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    runSearch();
  });

  input.addEventListener('input', runSearch);
  runSearch();
})();
