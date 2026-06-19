
(function () {
  var heroTimer = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(heroTimer);
      heroTimer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });
    restart();
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-header-search]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function setupSearchPage() {
    var input = document.querySelector('[data-live-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
    var empty = document.querySelector('[data-empty-state]');
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var activeCategory = 'all';
    input.value = query;

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var category = card.getAttribute('data-category') || '';
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedCategory = activeCategory === 'all' || category === activeCategory;
        var isVisible = matchedKeyword && matchedCategory;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', applyFilter);
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-filter-button') || 'all';
        filters.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
    applyFilter();
  }

  function setupPlayer() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));
    boxes.forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('[data-player-cover]');
      var button = box.querySelector('[data-player-button]');
      var started = false;
      var hlsInstance = null;
      if (!video) {
        return;
      }

      function hideCover() {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      }

      function begin() {
        var url = video.getAttribute('data-video-url');
        if (!url) {
          return;
        }
        hideCover();
        if (!started) {
          started = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
          } else {
            video.src = url;
          }
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            hideCover();
          });
        }
      }

      box.addEventListener('click', function (event) {
        if (event.target === video && started) {
          return;
        }
        begin();
      });
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          begin();
        });
      }
      video.addEventListener('play', hideCover);
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupSearchPage();
    setupPlayer();
  });
})();
