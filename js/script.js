/**
 * main.js
 * - 햄버거 메뉴 (모든 페이지 공통)
 * - FAQ 아코디언 (zfold.html)
 */

document.addEventListener('DOMContentLoaded', function () {

  /* =============================================
     햄버거 메뉴 토글
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
        requestAnimationFrame(function () {
          mobileNav.style.opacity   = '1';
          mobileNav.style.transform = 'translateY(0)';
        });
      } else {
        closeMenu();
      }
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (
        hamburger.classList.contains('is-active') &&
        !hamburger.contains(e.target) &&
        !mobileNav.contains(e.target)
      ) {
        closeMenu();
      }
    });

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
     ============================================= */
  const faqContainer = document.querySelector('.faq_question');

  if (faqContainer) {
    const faqArticles = faqContainer.querySelectorAll('article');

    faqArticles.forEach(function (article) {
      const btn    = article.querySelector('button');
      const answer = article.querySelector('.faq_answer');
      if (!btn) return;

      btn.addEventListener('click', function () {
        const isOpen = article.classList.contains('is-open');

        faqArticles.forEach(function (a) {
          a.classList.remove('is-open');
          const b   = a.querySelector('button');
          const ans = a.querySelector('.faq_answer');
          if (b)   b.setAttribute('aria-expanded', 'false');
          if (ans) ans.classList.remove('is-open');
        });

        if (!isOpen) {
          article.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          if (answer) answer.classList.add('is-open');
        }
      });
    });
  }

});