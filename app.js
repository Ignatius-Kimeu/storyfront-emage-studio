/* E-Mage Studio — shared behaviour. Vanilla, no libraries. */
(function () {
  'use strict';

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector('.burger');
  var panel = document.querySelector('.nav-mobile');
  if (burger && panel) {
    burger.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        panel.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- smart sticky header ----------
     hides on scroll down, comes back the moment you scroll up from anywhere */
  var header = document.querySelector('.site-header');
  var lastY = window.pageYOffset;
  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (!header) return;
    if (panel && panel.classList.contains('open')) { header.classList.remove('hide'); lastY = y; return; }
    if (y > lastY + 6 && y > 220) header.classList.add('hide');
    else if (y < lastY - 6) header.classList.remove('hide');
    lastY = y;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });

  /* ---------- scroll reveal ----------
     Everything starts visible in CSS. We only add .armed (which hides it)
     once we know JS is alive and IntersectionObserver exists — and even then
     a 2.5s timeout force-reveals anything that never got observed. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  if (items.length && !reduce && 'IntersectionObserver' in window) {
    items.forEach(function (el) { el.classList.add('armed'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add('in'); });
    }, 2500);
  }

  /* ---------- gallery filters ---------- */
  var filterBar = document.querySelector('.filters');
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var cat = btn.getAttribute('data-cat');
      [].forEach.call(filterBar.querySelectorAll('button'), function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      [].forEach.call(document.querySelectorAll('.tiles .tile'), function (t) {
        var show = cat === 'all' || t.getAttribute('data-cat') === cat;
        t.style.display = show ? '' : 'none';
      });
    });
  }

  /* ---------- lightbox ----------
     Reads src/caption straight off the DOM tiles. No duplicated image array. */
  var lb = document.querySelector('.lb');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lb-cap');
    var current = [];
    var idx = 0;

    function visibleTiles() {
      return [].slice.call(document.querySelectorAll('.tiles .tile')).filter(function (t) {
        return t.style.display !== 'none';
      });
    }
    function show(i) {
      if (!current.length) return;
      idx = (i + current.length) % current.length;
      var t = current[idx];
      lbImg.src = t.getAttribute('data-full');
      lbImg.alt = t.getAttribute('data-cap') || 'E-Mage Studio photograph';
      lbCap.innerHTML = '<b>' + (t.getAttribute('data-cap') || '') + '</b> &nbsp;·&nbsp; ' + (idx + 1) + ' / ' + current.length;
    }
    function open(t) {
      current = visibleTiles();
      var i = current.indexOf(t);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      show(i < 0 ? 0 : i);
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
    }

    document.addEventListener('click', function (e) {
      var tile = e.target.closest('.tiles .tile');
      if (tile) { e.preventDefault(); open(tile); return; }
      if (e.target.closest('.lb-close')) return close();
      if (e.target.closest('.lb-next')) return show(idx + 1);
      if (e.target.closest('.lb-prev')) return show(idx - 1);
      if (e.target === lb) return close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }
})();
