/**
 * swipe.js
 * 가로 스와이프 — 드래그 · 터치 · Shift+휠 / 가로휠
 *
 * 동작 모드 (뷰포트 기준)
 *   1025px+    : 자유 스크롤 (관성 적용)
 *   657~1024px : 2장 표시 · 1장씩 스냅
 *   ~481px     : 1장 표시 · 1장씩 스냅
 */

document.addEventListener('DOMContentLoaded', () => {

  const TRACKS = [
    /* galaxyphone.html */
    { section: '#phone',            box: '#phone .box'                  },
    { section: '#accessories',      box: '#accessories .box'            },
    { section: '#accessories_item', box: '#accessories_item .box'       },
    { section: '#service',          box: '#service .box'                },
    /* 공통 (index.html / galaxyphone.html) */
    { section: '#popup_card',       box: '#popup_card .box'         },
    /* index.html */
    { section: '#layer_card',       box: '#layer_card .container .box'  },
  ];

  const seen = new Set();

  TRACKS.forEach(({ section: sectionSel, box: boxSel }) => {
    if (seen.has(sectionSel)) return;
    seen.add(sectionSel);

    const section   = document.querySelector(sectionSel);
    const box       = document.querySelector(boxSel);
    if (!section || !box) return;

    const container = section.querySelector('.container');

    /* ── 헬퍼 ─────────────────────────────────────────── */

    const getMode = () => {
      const w = window.innerWidth;
      if (w <= 481) return 'snap1';   // 1장
      if (w <= 1024) return 'snap2';  // 2장
      return 'free';
    };

    /* 섹션 기준으로 컨테이너 시작 X 좌표 */
    const getStartX = () =>
      container
        ? container.getBoundingClientRect().left -
          section.getBoundingClientRect().left
        : 0;

    /* 카드 1장 너비 + gap */
    const getCardStep = () => {
      const first = box.firstElementChild;
      if (!first) return 0;
      const gap = parseFloat(getComputedStyle(box).gap) || 0;
      return first.offsetWidth + gap;
    };

    box.style.left = '0px';

    let startX     = getStartX();
    let translateX = startX;
    let isDragging = false;
    let dragStartX = 0;
    let velocity   = 0;
    let lastX      = 0;
    let rafId      = null;

    const getMinX = () =>
      startX - Math.max(0, box.scrollWidth - (section.offsetWidth - startX));

    const clamp = (v) => Math.max(getMinX(), Math.min(startX, v));

    const applyTranslate = (x, animated = false) => {
      translateX = clamp(x);
      box.style.transition = animated
        ? 'transform 0.35s cubic-bezier(0.25,0.1,0.25,1)'
        : 'none';
      box.style.transform = `translateX(${translateX}px)`;
    };

    /* ── 스냅 ─────────────────────────────────────────── */
    const snap = () => {
      const mode = getMode();
      if (mode === 'free') { startInertia(); return; }

      const step = getCardStep();
      if (step <= 0) return;

      const scrolled = startX - translateX;
      let idx = Math.round(scrolled / step);

      if (Math.abs(velocity) > 2) {
        idx = velocity < 0
          ? Math.ceil(scrolled / step)
          : Math.floor(scrolled / step);
      }

      idx = Math.max(0, idx);
      applyTranslate(startX - idx * step, true);
      velocity = 0;
    };

    /* ── 관성 (free 전용) ─────────────────────────────── */
    const startInertia = () => {
      cancelAnimationFrame(rafId);
      const tick = () => {
        velocity *= 0.93;
        if (Math.abs(velocity) < 0.4) return;
        const next    = translateX + velocity;
        const clamped = clamp(next);
        if (clamped !== next) velocity *= -0.2;
        applyTranslate(clamped);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    applyTranslate(startX);

    /* ── 마우스 드래그 ────────────────────────────────── */
    section.addEventListener('mousedown', (e) => {
      cancelAnimationFrame(rafId);
      isDragging = true;
      dragStartX = e.clientX - translateX;
      lastX      = e.clientX;
      velocity   = 0;
      section.style.cursor     = 'grabbing';
      section.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      velocity = e.clientX - lastX;
      lastX    = e.clientX;
      applyTranslate(e.clientX - dragStartX);
    });

    const stopMouse = () => {
      if (!isDragging) return;
      isDragging = false;
      section.style.cursor     = 'grab';
      section.style.userSelect = '';
      snap();
    };

    document.addEventListener('mouseup',    stopMouse);
    document.addEventListener('mouseleave', stopMouse);

    /* ── 터치 ─────────────────────────────────────────── */
    let touchOriginX = 0;
    let touchOriginY = 0;
    let isTouchSlide = false;

    section.addEventListener('touchstart', (e) => {
      cancelAnimationFrame(rafId);
      const t      = e.touches[0];
      touchOriginX = t.clientX - translateX;
      touchOriginY = t.clientY;
      lastX        = t.clientX;
      velocity     = 0;
      isTouchSlide = false;
    }, { passive: true });

    section.addEventListener('touchmove', (e) => {
      const t  = e.touches[0];
      const dx = Math.abs(t.clientX - (touchOriginX + translateX));
      const dy = Math.abs(t.clientY - touchOriginY);

      if (!isTouchSlide && dy > dx) return;
      isTouchSlide = true;

      velocity = t.clientX - lastX;
      lastX    = t.clientX;
      applyTranslate(t.clientX - touchOriginX);
      e.preventDefault();
    }, { passive: false });

    section.addEventListener('touchend', () => {
      if (isTouchSlide) snap();
    });

    /* ── 휠 (가로 / Shift+세로) ───────────────────────── */
    section.addEventListener('wheel', (e) => {
      const isH  = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const isSW = e.shiftKey && e.deltaY !== 0;
      if (!isH && !isSW) return;

      const delta = isH ? e.deltaX : e.deltaY;
      cancelAnimationFrame(rafId);
      applyTranslate(translateX - delta);
      e.preventDefault();
    }, { passive: false });

    /* ── 커서 & 리사이즈 ─────────────────────────────── */
    section.style.cursor = 'grab';

    window.addEventListener('resize', () => {
      startX     = getStartX();
      translateX = clamp(translateX);
      applyTranslate(translateX, true);
    });
  });

});