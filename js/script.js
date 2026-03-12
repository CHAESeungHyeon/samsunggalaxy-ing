/**
 * main.js
 * - 햄버거 메뉴 (모든 페이지 공통)
 * - FAQ 아코디언 (zfold.html)
 */

document.addEventListener('DOMContentLoaded', function () {

  /* =============================================
     햄버거 메뉴 토글
     - #hamburger 버튼 클릭 시 .is-active 토글
     - #mobileNav 에 .nav-open 토글
     - 메뉴 외부 클릭 시 닫힘
     - ESC 키 누르면 닫힘
     ============================================= */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {

    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.toggle('is-active');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');

      if (isOpen) {
        mobileNav.classList.add('nav-open');
        // display:block 후 transition 발동을 위해 한 프레임 지연
        requestAnimationFrame(function () {
          mobileNav.style.opacity = '1';
          mobileNav.style.transform = 'translateY(0)';
        });
      } else {
        closeMenu();
      }
    });

    // 메뉴 링크 클릭 시 닫힘
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // 메뉴 외부 클릭 시 닫힘
    document.addEventListener('click', function (e) {
      if (
        hamburger.classList.contains('is-active') &&
        !hamburger.contains(e.target) &&
        !mobileNav.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // ESC 키로 닫힘
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hamburger.classList.contains('is-active')) {
        closeMenu();
        hamburger.focus();
      }
    });

    function closeMenu() {
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', '메뉴 열기');
      mobileNav.classList.remove('nav-open');
    }
  }


  /* =============================================
     FAQ 아코디언 (zfold.html)
     - .faq_question 안의 article 클릭 시 토글
     - 다른 항목은 자동으로 닫힘 (한 번에 하나만 열림)
     - article에 .is-open 토글
     - 내부 .faq_answer에 .is-open 토글
     - aria-expanded 접근성 처리
     ============================================= */
  const faqContainer = document.querySelector('.faq_question');

  if (faqContainer) {
    const faqArticles = faqContainer.querySelectorAll('article');

    faqArticles.forEach(function (article) {
      const btn = article.querySelector('button');
      const answer = article.querySelector('.faq_answer');

      if (!btn) return;

      btn.addEventListener('click', function () {
        const isCurrentlyOpen = article.classList.contains('is-open');

        // 모든 항목 닫기
        faqArticles.forEach(function (a) {
          a.classList.remove('is-open');
          const b = a.querySelector('button');
          const ans = a.querySelector('.faq_answer');
          if (b) b.setAttribute('aria-expanded', 'false');
          if (ans) ans.classList.remove('is-open');
        });

        // 클릭한 항목이 닫혀있었으면 열기
        if (!isCurrentlyOpen) {
          article.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          if (answer) answer.classList.add('is-open');
        }
      });
    });
  }

});