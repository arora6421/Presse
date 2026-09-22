/* =========================================================================
   pressé — preloader + setup
   Holds the viewport behind the branded preloader until the experience is
   ready: the scroll-controlled VIDEO on desktop, or the hero photograph on
   touch / reduced-motion / no-video paths. Also decides the reduced branch.
   ========================================================================= */

(function () {
  'use strict';

  var reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* older browsers: assume motion is fine */ }
  window.PRESSE_REDUCED = reduced;

  var body = document.body;
  var preloader = document.getElementById('preloader');
  var HERO_SRC = 'assets/images/nail_hero.jpg';
  var revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;

    body.classList.add('is-ready');
    document.dispatchEvent(new CustomEvent('presse:ready'));

    if (!preloader) return;

    /* CSS transition (not GSAP) so the fade never depends on the rAF ticker. */
    preloader.classList.add('is-hiding');
    var clear = function () { preloader.hidden = true; };
    preloader.addEventListener('transitionend', clear, { once: true });
    setTimeout(clear, 900);
  }

  /* Which experience will run? The video is desktop / fine-pointer only —
     touch devices and reduced-motion get the photograph pipeline. */
  var video = document.querySelector('.cinematic__video');
  var wantVideo = !reduced && !!video &&
    window.matchMedia('(min-width: 769px) and (pointer: fine)').matches;

  if (wantVideo) {
    /* Kick the decoder: a muted play()/pause() is what makes a <video> reliably
       buffer + become seekable when it will never actually be played. */
    var kick = function () {
      try {
        var pr = video.play();
        if (pr && pr.then) pr.then(function () { video.pause(); }, function () {});
      } catch (e) {}
    };

    try { video.preload = 'auto'; video.load(); } catch (e) {}
    kick();
    video.addEventListener('loadedmetadata', kick, { once: true });

    /* reveal as soon as the first frames are decoded — seeks buffer on demand,
       so we don't need the whole clip (canplaythrough) before starting */
    if (video.readyState >= 2) reveal();
    video.addEventListener('loadeddata', function () { setTimeout(reveal, 350); }, { once: true });
    video.addEventListener('canplaythrough', reveal, { once: true });
    video.addEventListener('error', reveal, { once: true });   // never trap the user
  } else {
    /* wait for the hero photograph */
    var img = new Image();
    img.onload = reveal;
    img.onerror = reveal;
    img.src = HERO_SRC;
    if (img.complete) reveal();
  }

  /* Fallbacks: full page load, and a hard ceiling (video can be a few MB). */
  window.addEventListener('load', reveal);
  setTimeout(reveal, 12000);
})();
