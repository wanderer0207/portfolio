
// 3Dポートフォリオのギャラリー操作
const galleryWrap = document.querySelector('#galleryWrap');
const gallery = document.querySelector('#gallery');
const projects = [...document.querySelectorAll('.project')];
const progressBar = document.querySelector('#progressBar');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

let pointerX = 0;
let scrollShift = 0;
let dragging = false;
let dragStartX = 0;
let dragStartShift = 0;
let activePointerId = null;
let animationId = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// 最後の作品まで移動できる距離を計算
function getMaxShift() {
  if (!gallery || !galleryWrap || projects.length === 0) {
    return 0;
  }

  const lastProject = projects[projects.length - 1];
  const galleryWidth = gallery.clientWidth;
  const lastProjectEnd =
    lastProject.offsetLeft + lastProject.offsetWidth;

  return Math.max(0, lastProjectEnd - galleryWidth);
}

// ギャラリーの表示を更新
function updateGallery() {
  if (!gallery || !galleryWrap) return;

  const maxShift = getMaxShift();
  scrollShift = clamp(scrollShift, 0, maxShift);

  gallery.style.transform =
    `translate3d(${-scrollShift}px, 0, 0) ` +
    `rotateY(${pointerX * -2.5}deg)`;

  projects.forEach((project, index) => {
    const depth = Number(project.dataset.depth || 0.05);
    const centerOffset = index - (projects.length - 1) / 2;

    const offset = dragging
      ? 0
      : centerOffset * pointerX * -5;

    const tilt = dragging
      ? 0
      : centerOffset * -1.5 + pointerX * depth * 15;

    project.style.transform =
      `translate3d(${offset}px, 0, ${depth * 50}px) ` +
      `rotateY(${tilt}deg)`;
  });

  if (progressBar) {
    const ratio = maxShift > 0 ? scrollShift / maxShift : 0;
    progressBar.style.transform =
      `scaleX(${Math.max(0.12, ratio)})`;
  }

  animationId = requestAnimationFrame(updateGallery);
}

if (galleryWrap && gallery) {
  animationId = requestAnimationFrame(updateGallery);

  // マウス位置に合わせて立体感を調整
  galleryWrap.addEventListener('pointermove', (event) => {
    if (dragging) {
      scrollShift = clamp(
        dragStartShift - (event.clientX - dragStartX),
        0,
        getMaxShift()
      );
      return;
    }

    // タッチ操作では傾きを控えめにする
    if (event.pointerType === 'touch') return;

    const rect = galleryWrap.getBoundingClientRect();

    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerX = clamp(pointerX, -1, 1);
  });

  galleryWrap.addEventListener('pointerleave', () => {
    if (!dragging) pointerX = 0;
  });

  // ドラッグ開始
  galleryWrap.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, button')) return;

    dragging = true;
    activePointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartShift = scrollShift;

    galleryWrap.classList.add('is-dragging');

    try {
      galleryWrap.setPointerCapture(event.pointerId);
    } catch (_) {
      // ポインター取得に失敗しても操作を継続
    }
  });

  // ドラッグ終了
  function stopDragging(event) {
    if (!dragging) return;

    if (
      event &&
      activePointerId !== null &&
      event.pointerId !== activePointerId
    ) {
      return;
    }

    dragging = false;
    activePointerId = null;
    dragStartShift = scrollShift;

    galleryWrap.classList.remove('is-dragging');
    pointerX = 0;
  }

  galleryWrap.addEventListener('pointerup', stopDragging);
  galleryWrap.addEventListener('pointercancel', stopDragging);
  galleryWrap.addEventListener('lostpointercapture', stopDragging);

  // 画面サイズ変更時に位置を補正
  window.addEventListener('resize', () => {
    scrollShift = clamp(scrollShift, 0, getMaxShift());
    updateGalleryPosition();
  });

  function updateGalleryPosition() {
    if (!gallery) return;
    gallery.style.transform = `translate3d(${-scrollShift}px, 0, 0)`;
  }

  // スクロールに応じて色味を少し変化
  window.addEventListener('scroll', () => {
    const rect = galleryWrap.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance =
      (window.innerHeight / 2 - center) / window.innerHeight;

    gallery.style.filter =
      `saturate(${1 - Math.min(1, Math.abs(distance)) * 0.12})`;
  }, { passive: true });
}

// モバイルメニュー
menuToggle?.addEventListener('click', () => {
  if (!nav) return;

  const isOpen = nav.classList.toggle('is-open');

  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.innerHTML = isOpen
    ? 'CLOSE <span>−</span>'
    : 'MENU <span>＋</span>';
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');

    if (menuToggle) {
      menuToggle.innerHTML = 'MENU <span>＋</span>';
    }
  });
});
