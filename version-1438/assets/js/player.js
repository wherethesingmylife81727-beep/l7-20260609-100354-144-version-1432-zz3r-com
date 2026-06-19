import { H as Hls } from '../vendor/hls-dru42stk.js';

const players = Array.from(document.querySelectorAll('[data-player-src]'));

function setStatus(panel, text) {
  const status = panel.querySelector('[data-player-status]');
  if (status) {
    status.textContent = text;
  }
}

function attachSource(video, source) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return Promise.resolve();
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video._hlsInstance = hls;
    return Promise.resolve();
  }

  video.src = source;
  return Promise.resolve();
}

players.forEach((panel) => {
  const video = panel.querySelector('video');
  const overlay = panel.querySelector('[data-player-overlay]');
  const source = panel.getAttribute('data-player-src');
  let started = false;

  async function start() {
    if (!video || !source) {
      return;
    }

    if (!started) {
      started = true;
      setStatus(panel, '正在加载影片...');
      await attachSource(video, source);
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    try {
      await video.play();
      setStatus(panel, '');
    } catch (error) {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
      setStatus(panel, '点击播放按钮开始观看');
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  const button = panel.querySelector('[data-player-button]');
  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('error', () => {
      setStatus(panel, '播放暂时不可用，请稍后重试');
    });
  }
});
