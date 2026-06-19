(function () {
  var header = document.getElementById('siteHeader');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-missing');
      if (img.parentElement) {
        img.parentElement.classList.add('image-missing');
      }
    }, { once: true });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === current);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        restart();
      });
    }

    restart();
  });

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var grid = document.querySelector('[data-filter-grid]');
    var empty = document.querySelector('[data-empty-state]');
    var input = panel.querySelector('[data-filter-input]');
    var typeSelect = panel.querySelector('[data-type-filter]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    function applyFilter() {
      if (!grid) return;
      var term = normalize(input ? input.value : '');
      var typeValue = typeSelect ? typeSelect.value : '全部类型';
      var yearValue = yearSelect ? yearSelect.value : '全部年份';
      var visible = 0;
      grid.querySelectorAll('[data-movie-card]').forEach(function (card) {
        var hay = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-meta'),
          card.textContent
        ].join(' '));
        var typeOk = typeValue === '全部类型' || hay.indexOf(normalize(typeValue)) >= 0;
        var yearOk = yearValue === '全部年份' || hay.indexOf(normalize(yearValue)) >= 0;
        var termOk = !term || hay.indexOf(term) >= 0;
        var show = typeOk && yearOk && termOk;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', applyFilter);
        el.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });

  window.FilmPlayer = {
    init: function (streamUrl) {
      var video = document.getElementById('moviePlayer');
      var layer = document.querySelector('[data-play-layer]');
      var hlsInstance = null;
      var started = false;

      function attach() {
        if (!video || started) return;
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) return;
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        attach();
        if (layer) {
          layer.classList.add('is-hidden');
        }
        if (video) {
          var result = video.play();
          if (result && typeof result.catch === 'function') {
            result.catch(function () {});
          }
        }
      }

      if (layer) {
        layer.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started) play();
        });
      }
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
