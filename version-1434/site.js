(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(dotIndex);
                start();
            });
        });

        start();
    }

    function setupFilters() {
        var toolbar = document.querySelector("[data-filter-toolbar]");
        if (!toolbar) {
            return;
        }
        var input = toolbar.querySelector("[data-search-input]");
        var year = toolbar.querySelector("[data-year-filter]");
        var region = toolbar.querySelector("[data-region-filter]");
        var visibleCount = toolbar.querySelector("[data-visible-count]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function matchYear(cardYear, selectedYear) {
            if (!selectedYear) {
                return true;
            }
            var numericYear = parseInt(cardYear, 10) || 0;
            if (selectedYear === "older") {
                return numericYear < 2020;
            }
            return String(cardYear) === selectedYear;
        }

        function apply() {
            var query = normalize(input && input.value);
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";
            var count = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.category,
                    card.dataset.keywords
                ].join(" "));
                var passQuery = !query || text.indexOf(query) !== -1;
                var passYear = matchYear(card.dataset.year, selectedYear);
                var passRegion = !selectedRegion || String(card.dataset.region || "").indexOf(selectedRegion) !== -1;
                var visible = passQuery && passYear && passRegion;
                card.hidden = !visible;
                if (visible) {
                    count += 1;
                }
            });

            if (visibleCount) {
                visibleCount.textContent = String(count);
            }
        }

        [input, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function setupPlayer() {
        var shell = document.querySelector("[data-player]");
        var video = document.querySelector("[data-movie-player]");
        var button = document.querySelector("[data-player-start]");
        var message = document.querySelector("[data-player-message]");
        if (!shell || !video || !button) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function attachSource() {
            var source = video.dataset.src;
            if (!source) {
                setMessage("当前影片暂未绑定播放地址");
                return false;
            }
            if (video.dataset.ready === "true") {
                return true;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.dataset.ready = "true";
                video._hlsInstance = hls;
                return true;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.dataset.ready = "true";
                return true;
            }
            setMessage("当前浏览器需要支持 HLS 才能播放");
            return false;
        }

        function play() {
            setMessage("");
            if (!attachSource()) {
                return;
            }
            shell.classList.add("is-playing");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    shell.classList.remove("is-playing");
                    setMessage("播放被浏览器拦截，请再次点击播放按钮");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove("is-playing");
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
