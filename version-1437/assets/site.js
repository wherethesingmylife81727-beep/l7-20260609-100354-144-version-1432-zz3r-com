(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = qs("[data-menu-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupForms() {
    qsa("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = qs("input[name='q']", form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function setupHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var root = qs("[data-filter-root]");
    var list = qs(".filter-list");
    if (!root || !list) {
      return;
    }
    var keyword = qs("[data-filter-keyword]", root);
    var year = qs("[data-filter-year]", root);
    var type = qs("[data-filter-type]", root);
    var reset = qs("[data-filter-reset]", root);
    var cards = qsa("[data-movie-card]", list);
    var empty = qs("[data-filter-empty]");

    function apply() {
      var word = keyword ? keyword.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var ok = true;
        if (word && haystack.indexOf(word) === -1) {
          ok = false;
        }
        if (y && card.getAttribute("data-year") !== y) {
          ok = false;
        }
        if (t && card.getAttribute("data-type") !== t) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [keyword, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (keyword) {
          keyword.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (type) {
          type.value = "";
        }
        apply();
      });
    }
    apply();
  }

  function cardHtml(item) {
    return [
      '<article class="movie-card">',
      '<a class="card-media" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="card-play">▶</span>',
      '<span class="card-badge">' + escapeHtml(item.category) + '</span>',
      '<span class="card-year">' + escapeHtml(item.year) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[ch];
    });
  }

  function setupSearchPage() {
    var results = qs("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var title = qs("[data-search-title]");
    var empty = qs("[data-search-empty]");
    var input = qs(".big-search input[name='q']");
    if (input) {
      input.value = query;
    }
    if (!query) {
      results.innerHTML = "";
      if (title) {
        title.textContent = "影片搜索";
      }
      if (empty) {
        empty.classList.add("is-visible");
      }
      return;
    }
    var q = query.toLowerCase();
    var matched = window.SEARCH_MOVIES.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
        .join(" ")
        .toLowerCase()
        .indexOf(q) !== -1;
    }).slice(0, 120);
    results.innerHTML = matched.map(cardHtml).join("");
    if (title) {
      title.textContent = query + " 搜索结果";
    }
    if (empty) {
      empty.textContent = matched.length ? "" : "没有匹配的影片";
      empty.classList.toggle("is-visible", matched.length === 0);
    }
  }

  function setupPlayer() {
    var player = qs("[data-player]");
    if (!player) {
      return;
    }
    var video = qs("video", player);
    var playButton = qs("[data-play-button]", player);
    var posterButton = qs("[data-player-poster]", player);
    var url = player.getAttribute("data-url");
    var hls = null;
    var readyToPlay = false;

    function attach() {
      if (readyToPlay || !video || !url) {
        return;
      }
      readyToPlay = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = url;
      }
    }

    function play(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      attach();
      player.classList.add("is-active");
      video.play().catch(function () {});
    }

    if (playButton) {
      playButton.addEventListener("click", play);
    }
    if (posterButton) {
      posterButton.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupForms();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
