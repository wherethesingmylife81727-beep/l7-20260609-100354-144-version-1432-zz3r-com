(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function initSiteSearch() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (value) {
                    window.location.href = "search.html?q=" + encodeURIComponent(value);
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                restart();
            });
        });
        restart();
    }

    function initLocalFilters() {
        var roots = document.querySelectorAll("[data-filter-root]");
        roots.forEach(function (root) {
            var input = root.querySelector("[data-filter-input]");
            var form = root.querySelector("[data-local-filter-form]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
            var chips = Array.prototype.slice.call(root.querySelectorAll("[data-filter-tag]"));
            var activeTag = "all";

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var category = card.getAttribute("data-category") || "";
                    var matchText = !query || text.indexOf(query) !== -1;
                    var matchTag = activeTag === "all" || category === activeTag;
                    card.style.display = matchText && matchTag ? "" : "none";
                });
            }

            if (form) {
                form.addEventListener("submit", function (event) {
                    event.preventDefault();
                    apply();
                });
            }
            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                if (query) {
                    input.value = query;
                    apply();
                }
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeTag = chip.getAttribute("data-filter-tag") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    apply();
                });
            });
        });
    }

    ready(function () {
        initNavigation();
        initSiteSearch();
        initHero();
        initLocalFilters();
    });
})();
