(function () {
    function initMoviePlayer(options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.coverId);
        var source = options.source;
        var loaded = false;
        var hlsPlayer = null;

        if (!video || !cover || !source) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsPlayer = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsPlayer.loadSource(source);
                hlsPlayer.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function play() {
            load();
            cover.classList.add("is-hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    cover.classList.remove("is-hidden");
                });
            }
        }

        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsPlayer) {
                hlsPlayer.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
