/**
 * swipe.js
 * 마우스 드래그 & 가로 휠(Shift+휠 / 가로 스크롤) 스와이프
 * 대상 섹션: #phone, #accessories, #accessories_item, #service, #popup_card
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 스와이프 대상 설정 ─────────────────────────────────────────
  const TRACKS = [
    { section: '#phone',            box: '#phone .box'            },
    { section: '#accessories',      box: '#accessories .box'      },
    { section: '#accessories_item', box: '#accessories_item .box' },
    { section: '#service',          box: '#service .box'          },
    { section: '#popup_card',       box: '#popup_card .txtcard'   },
  ];

  // ─── 각 트랙 초기화 ────────────────────────────────────────────
  TRACKS.forEach(({ section: sectionSel, box: boxSel }) => {
    const section   = document.querySelector(sectionSel);
    const box       = document.querySelector(boxSel);
    if (!section || !box) return;

    // .container 의 좌측 여백을 카드 시작 위치로 사용
    // (section 은 100% 너비, container 는 중앙 정렬되어 있으므로
    //  container.offsetLeft = (뷰포트 - 1200px) / 2 + section의 왼쪽 패딩)
    const container = section.querySelector('.container');
    const getStartX = () =>
      container
        ? container.getBoundingClientRect().left - section.getBoundingClientRect().left
        : 0;

    // box 를 absolute 기준 left:0 으로 고정한 뒤 translateX 로만 이동
    box.style.left = '0px';

    let startX     = getStartX();   // 컨테이너 시작 오프셋
    let translateX = startX;        // 현재 오프셋 (startX 에서 시작)
    let isDragging = false;
    let dragStartX = 0;
    let velocity   = 0;
    let lastX      = 0;
    let rafId      = null;

    // 드래그 가능한 최소값 (끝까지 당겼을 때)
    // startX ─────────────────── minX
    //         ← box.scrollWidth - (section.offsetWidth - startX) →
    const getMinX = () =>
      startX - (box.scrollWidth - (section.offsetWidth - startX));

    const clamp = (v) =>
      Math.max(getMinX(), Math.min(startX, v));

    const applyTranslate = (x, animated = false) => {
      translateX = clamp(x);
      box.style.transition = animated ? 'transform 0.3s ease' : 'none';
      box.style.transform  = `translateX(${translateX}px)`;
    };

    // 초기 위치 적용
    applyTranslate(startX);

    // ─── 관성 애니메이션 ─────────────────────────────────────────
    const startInertia = () => {
      cancelAnimationFrame(rafId);

      const tick = () => {
        velocity *= 0.93;
        if (Math.abs(velocity) < 0.5) return;

        const next    = translateX + velocity;
        const clamped = clamp(next);
        if (clamped !== next) velocity *= -0.2;   // 경계 바운스
        applyTranslate(clamped);

        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    // ─── 마우스 드래그 ────────────────────────────────────────────
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

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      section.style.cursor     = 'grab';
      section.style.userSelect = '';
      startInertia();
    };

    document.addEventListener('mouseup',    stopDrag);
    document.addEventListener('mouseleave', stopDrag);

    // ─── 휠 가로 스크롤 ───────────────────────────────────────────
    // 가로 휠(트랙패드 스와이프 · deltaX) 또는 Shift+세로휠 일 때만 동작
    // 일반 세로 휠은 페이지 스크롤로 그대로 흘려보냄
    section.addEventListener('wheel', (e) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY); // 가로 스크롤
      const isShiftWheel = e.shiftKey && e.deltaY !== 0;             // Shift + 휠

      if (!isHorizontal && !isShiftWheel) return; // 일반 세로 휠 → 통과

      const delta = isHorizontal ? e.deltaX : e.deltaY;
      cancelAnimationFrame(rafId);
      applyTranslate(translateX - delta);
      e.preventDefault();
    }, { passive: false });

    // ─── 커서 스타일 ──────────────────────────────────────────────
    section.style.cursor = 'grab';

    // ─── 창 크기 변경 시 재계산 ───────────────────────────────────
    window.addEventListener('resize', () => {
      startX     = getStartX();
      translateX = clamp(translateX);
      applyTranslate(translateX, true);
    });
  });

});