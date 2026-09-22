/* =========================================================================
   pressé — cinematic scroll experience
   The user's scroll IS the camera.

   DESKTOP (fine pointer): scroll scrubs a VIDEO frame-by-frame (Apple-style),
   then a nude wash covers an invisible swap to the illustrated SVG nail.
   TOUCH / reduced-motion: the same swap, but the "camera move" is a
   scroll-zoomed photograph instead of the video.
   ========================================================================= */

(function () {
  'use strict';

  /* ---- Editable configuration ----------------------------------------- */

  var nailFocus       = { x: 34, y: 58 };   // photo-pipeline focus point (%)
  var nailFocusMobile = { x: 50, y: 60 };

  var ZOOM_SCALE        = 2.2;
  var ZOOM_SCALE_MOBILE = 2.1;
  var SCROLL_LENGTH     = '+=550%';  // pinned scroll distance (~5.5x viewport)
  var ANNOTATION_COUNT  = 4;

  var VIDEO_END = 0.58;   // scroll progress at which the video reaches its last frame
                          // (a short "breath" then the slow fade begins ~0.60)

  /* ---- Handoff + pull-back --------------------------------------------------
     ONE continuous camera move in reverse: the still close-up sits behind the
     video already blown up to match the nail in the video's last frame. The
     video fades out VERY slowly over a long scroll range while — overlapping,
     before that fade even finishes — the still begins scaling down to its
     annotation size, linear and scroll-locked, so the cream ground drifts in
     around it. No hard cuts, no snaps. Fine-tune once you can see both. */
  var handoffConfig = {
    initialScale: 2.5,       // starting scale — match to the video's last frame
    finalScale:   1,         // annotation size
    fadeStartScroll: 0.60,   // when the video starts fading
    fadeEndScroll:   0.70,   // when the video is fully gone
    scaleStartScroll: 0.68,  // when the pull-back begins (overlaps the fade)
    scaleEndScroll:   0.82,  // when the nail reaches its final size
    top:  '50%',             // position alignment with the video
    left: '50%',             // position alignment with the video
    translateX: 0,           // fine-tune horizontal alignment, px
    translateY: 0            // fine-tune vertical alignment, px
  };
  /* lerp factor for the seek loop: lower = smoother / more cinematic lag.
     0.05 very smooth, 0.15 more responsive. (?nolerp snaps for deterministic QA) */
  var SEEK_LERP = /[?&]nolerp\b/.test(location.search) ? 1 : 0.08;

  /* ---- Elements ------------------------------------------------------- */

  var root      = document.querySelector('.cinematic');
  var stage     = document.querySelector('.cinematic__stage');
  var video     = document.querySelector('.cinematic__video');
  var wide      = document.querySelector('.cinematic__photo.is-wide');
  var wideSharp = document.querySelector('.cinematic__photo.is-wide .is-sharp');
  var wideBlur  = document.querySelector('.cinematic__photo.is-wide .is-blur');
  var heroLayers = [wideSharp, wideBlur];
  var veil      = document.querySelector('.cinematic__veil');
  var figure    = document.querySelector('.cinematic__figure');
  var nail      = document.querySelector('.cinematic__nail');
  var nailShadow = document.querySelector('.cinematic__nail-shadow');
  var intro      = document.querySelector('.cinematic__intro');
  var introInner = document.querySelector('.cinematic__intro-inner');
  var hint     = document.querySelector('.cinematic__hint');
  var arrows   = Array.prototype.slice.call(document.querySelectorAll('.annotation__arrow'));
  var texts    = Array.prototype.slice.call(document.querySelectorAll('.annotation__text'));

  /* Per-annotation orientation of the shared curly-arrow image (curlyarrow1.svg
     points up-left by default). flipX / flipY mirror it, rot re-aims it at the
     label, and dx/dy is the small "draw-in from the nail" offset it eases from. */
  var ARROW_TX = [
    { rot:  22, flipX:  1, flipY: -1, dx:  34, dy: -30 },  /* ar0 -> BIAB Base (lower left)        */
    { rot:   4, flipX: -1, flipY:  1, dx: -40, dy:  30 },  /* ar1 -> High-shine Finish (top right) */
    { rot:  40, flipX: -1, flipY:  1, dx: -30, dy:  12 },  /* ar2 -> Precision Shape (right)       */
    { rot: -30, flipX:  1, flipY:  1, dx:  30, dy:  12 }   /* ar3 -> Durable Design (left)         */
  ];

  if (!stage || !window.gsap) return;

  /* ---- Reduced motion: static layout, no scroll animation ------------ */

  var forceStatic = /[?&]reduced\b/.test(location.search);
  if (window.PRESSE_REDUCED || forceStatic || !window.ScrollTrigger) {
    return;   /* the page ships with `is-static` already set */
  }

  if (root) root.classList.remove('is-static');

  /* ---- Scroll-controlled video playback ----------------------------------
     ONE thing controls video.currentTime: the lerp loop below. ScrollTrigger
     never touches it — the loop just reads the trigger's scrub-smoothed
     progress (so `scrub: 2` flows through), eases toward that target, and
     caps the actual seek at ~30fps (browsers seek cleanly at 30, not 60).
     The double smoothing (2s scrub + lerp) is the buttery, cinematic feel. */

  var vST      = null;   // the video's ScrollTrigger (captured in the build)
  var targetTime = 0;    // where the scroll wants the video (seconds)
  var seekTime   = 0;    // the lerped value we actually seek to
  var lastSeek   = 0;    // rAF timestamp of the last currentTime write

  function smoothVideoScrub(ts) {
    requestAnimationFrame(smoothVideoScrub);
    if (!video || !video.duration || !vST) return;
    if (video.style.display === 'none') return; /* swapped out — stop poking it */
    if (!video.paused) video.pause();          /* scrubbed, never played */

    /* target = scrub-smoothed scroll progress -> video time */
    var anim = vST.animation;
    var p = anim ? anim.progress() : vST.progress;
    targetTime = Math.min(p / VIDEO_END, 1) * Math.max(video.duration - 0.05, 0);

    if (ts - lastSeek < 33) return;            /* FIX 4: ~30fps seek cap */
    lastSeek = ts;
    seekTime += (targetTime - seekTime) * SEEK_LERP;   /* FIX 1: lerp toward target */
    if (Math.abs(seekTime - video.currentTime) > 0.01) {
      try { video.currentTime = seekTime; } catch (e) {}
    }
  }

  if (video) {
    video.muted = true;
    requestAnimationFrame(smoothVideoScrub);

    /* If the video can't load (errored, or a badly-muxed file that stalls),
       fall back to the photograph as a static backdrop — the rest of the
       sequence (wash -> nail -> annotations) still holds up. */
    var videoFellBack = false;
    function videoFallback() {
      if (videoFellBack) return;
      videoFellBack = true;
      video.style.display = 'none';
      if (wide) wide.style.display = 'block';   /* both are position:absolute inset:0 — no reflow */
    }
    var fallbackTimer = setTimeout(function () {
      if (!video.duration || !isFinite(video.duration)) videoFallback();
    }, 15000);

    /* cancel the fallback once metadata is in — the seek loop reads
       video.duration fresh every frame, so no ScrollTrigger.refresh() needed */
    video.addEventListener('loadedmetadata', function () {
      clearTimeout(fallbackTimer);
    }, { once: true });
    video.addEventListener('error', videoFallback, { once: true });
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---- CHANGE 3: the nail group floats + drifts toward the cursor -------
     The whole figure (nail + curly arrows + labels + shadow) is one group.
     It idles with a gentle bob and, on a fine pointer, eases toward the
     cursor with a subtle 3D tilt. Only engages once the illustration has
     been revealed (progress > ~0.66). Mobile = bob only. */

  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var mX = 0, mY = 0, cX = 0, cY = 0;

  if (finePointer) {
    document.addEventListener('mousemove', function (e) {
      mX = (e.clientX / window.innerWidth  - 0.5) * 30;   /* -> max +/-15px */
      mY = (e.clientY / window.innerHeight - 0.5) * 30;
    }, { passive: true });
  }

  function floatNail(ts) {
    requestAnimationFrame(floatNail);
    if (!figure) return;

    var prog = window.__cineTL ? window.__cineTL.progress() : 0;
    /* only once the nail has finished pulling back to its settled size */
    var strength = prog <= 0.80 ? 0 : Math.min((prog - 0.80) / 0.04, 1);

    /* gentle idle bob (~3.8s period) so the nail feels alive with no input */
    var bob = Math.sin(ts / 600) * 5 * strength;

    /* smooth drift toward the cursor — lerp, never snap */
    cX += (mX * strength - cX) * 0.05;
    cY += (mY * strength - cY) * 0.05;

    var rotX = finePointer ? (-cY * 0.3) : 0;   /* max +/-4.5deg */
    var rotY = finePointer ? ( cX * 0.3) : 0;

    figure.style.transform =
      'translate(' + cX.toFixed(2) + 'px, ' + (cY + bob).toFixed(2) + 'px)' +
      ' rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';

    if (nailShadow) {
      /* the shadow trails the movement a little (parallax = lift) */
      nailShadow.style.transform =
        'translate(-50%, -50%)' +
        ' translate(' + (cX * -0.35).toFixed(2) + 'px, ' + (bob * 0.6 + 6).toFixed(2) + 'px)' +
        ' scale(' + (1 + Math.abs(cX) * 0.006).toFixed(3) + ')';
    }
  }
  requestAnimationFrame(floatNail);

  /* ---- Build the timeline (re-runs per breakpoint via matchMedia) ---- */

  function buildTimeline(focus, zoom, useVideo) {
    var fx = focus.x / 100;
    var fy = focus.y / 100;

    function zoomVars(s, extra) {
      var k = (s - 1) / (zoom - 1);
      var v = {
        scale: s,
        xPercent: k * -zoom * (fx - 0.5) * 100,
        yPercent: k * -zoom * (fy - 0.5) * 100
      };
      if (extra) for (var key in extra) v[key] = extra[key];
      return v;
    }

    var PEAK_ZOOM = 3.0;   // photo pipeline: capped at 300% — plenty to lose detail

    /* the camera layer (video or hero photo) sits ABOVE the still nail image
       so the handoff is just the camera fading away to reveal what's under it */
    if (useVideo) {
      gsap.set(wide, { display: 'none' });
      gsap.set(video, { display: 'block', autoAlpha: 1, zIndex: 3, clearProps: 'filter' });
    } else {
      if (video) gsap.set(video, { display: 'none' });
      gsap.set(wide, { zIndex: 3 });
      gsap.set(heroLayers, zoomVars(1, { transformOrigin: '50% 50%' }));
    }

    /* park the close-up nail image where it lines up with the video's final
       frame, blown up to initialScale (desktop / absolute layout only —
       mobile keeps its stacked flow) */
    var absoluteLayout = window.matchMedia('(min-width: 769px)').matches;
    if (absoluteLayout) {
      gsap.set(nail, {
        top: handoffConfig.top,
        left: handoffConfig.left,
        xPercent: -50,
        yPercent: -50,
        x: handoffConfig.translateX,
        y: handoffConfig.translateY,
        scale: handoffConfig.initialScale,
        transformOrigin: '50% 50%'
      });
    }

    var nolerp = /[?&]nolerp\b/.test(location.search);
    /* FIX 2: 2s of scrub smoothing for the cinematic video path (photo path
       keeps its 1s). `?nolerp` snaps for deterministic QA screenshots. */
    var scrubValue = nolerp ? true : (useVideo ? 2 : 1);

    var tl = gsap.timeline({
      defaults: { ease: 'none' },   /* compositor promotion is done in CSS (translateZ) */
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: SCROLL_LENGTH,
        scrub: scrubValue,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    /* the seek loop reads this trigger's scrub-smoothed progress; it never
       writes video.currentTime itself */
    if (useVideo) vST = tl.scrollTrigger;

    /* the cream wash + scroll hint + wordmark all clear as scrolling starts */
    tl.to(veil, { autoAlpha: 0, duration: 0.09 }, 0.02);
    tl.to(hint, { autoAlpha: 0, duration: 0.03 }, 0.01);
    tl.to(intro,      { autoAlpha: 0, duration: 0.13 }, 0.05);
    tl.to(introInner, { y: -24,       duration: 0.13 }, 0.05);

    /* 0.00 - VIDEO_END : THE CAMERA MOVE
       video path -> smoothVideoScrub drives currentTime; nothing to tween here,
                     the video just plays to its final close-up frame.
       photo path -> the hero photo scales in toward the nail. */
    var cameraLayer = useVideo ? video : heroLayers;
    if (!useVideo) {
      tl.to(heroLayers, zoomVars(zoom,        { duration: 0.42 }), 0);
      tl.to(heroLayers, zoomVars(PEAK_ZOOM,   { duration: 0.21 }), 0.42);
    }

    /* fadeStart - fadeEnd : THE SLOW DISSOLVE
       The still close-up already stands centred BEHIND the camera layer, blown
       up to initialScale so it matches the nail in the video's final frame.
       The camera layer fades to nothing VERY slowly across the whole range — a
       long overlap where both are partly visible — so it reads as the video
       gently resolving into a cleaner still of the same thing. No blur, no wash. */
    var fadeStart  = handoffConfig.fadeStartScroll;
    var fadeEnd    = handoffConfig.fadeEndScroll;
    var scaleStart = handoffConfig.scaleStartScroll;
    var scaleEnd   = handoffConfig.scaleEndScroll;

    tl.set(nail,       { autoAlpha: 1 }, Math.max(fadeStart - 0.03, 0));  /* live under the still-opaque camera */
    tl.set(nailShadow, { autoAlpha: 0 }, Math.max(fadeStart - 0.03, 0));
    tl.to(cameraLayer, { autoAlpha: 0, duration: fadeEnd - fadeStart }, fadeStart);
    if (useVideo) tl.set(video, { display: 'none' }, fadeEnd);
    else          tl.set(wide,  { display: 'none' }, fadeEnd);

    /* scaleStart - scaleEnd : THE PULL-BACK — starts BEFORE the fade finishes
       so the two overlap into one motion. The still scales initialScale ->
       finalScale with ease 'none', tied 1:1 to scroll, like the camera
       drifting steadily back off the nail; the cream ground emerges around it. */
    if (absoluteLayout) {
      tl.fromTo(nail,
        { scale: handoffConfig.initialScale },
        { scale: handoffConfig.finalScale, duration: scaleEnd - scaleStart, ease: 'none' },
        scaleStart);
    }

    /* 0.80 - 0.84 : NAIL SETTLES — the soft shadow eases in over the same range
       the float loop ramps its movement from 0 to full (see floatNail) */
    tl.to(nailShadow, { autoAlpha: 0.9, duration: 0.04 }, 0.80);

    /* 0.84 - 0.95 : DISSECT — each curly arrow eases out from the nail toward
       its label (opacity + translate), then the label fades up */
    for (var i = 0; i < ANNOTATION_COUNT; i++) {
      var at = 0.84 + i * 0.025;
      if (arrows[i]) {
        var tx = ARROW_TX[i] || { rot: 0, flipX: 1, flipY: 1, dx: 0, dy: 0 };
        gsap.set(arrows[i], {
          rotation: tx.rot,
          scaleX: tx.flipX,
          scaleY: tx.flipY,
          transformOrigin: '50% 50%'
        });
        tl.fromTo(arrows[i],
          { autoAlpha: 0, x: tx.dx, y: tx.dy },
          { autoAlpha: 1, x: 0, y: 0, duration: 0.05, ease: 'power2.out' },
          at);
      }
      if (texts[i]) {
        tl.fromTo(texts[i],
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.03 },
          at + 0.04);
      }
    }

    /* 0.90 - 1.00 : HOLD */
    tl.to({}, { duration: 0.10 }, 0.90);

    window.__cineTL = tl;   /* handle for manual QA (harmless in production) */
    return tl;
  }

  /* ---- Breakpoints: video on desktop fine-pointer, photo everywhere else -- */

  var canVideo = !!video && !video.error;
  var mm = gsap.matchMedia();

  mm.add('(min-width: 769px) and (pointer: fine)', function () {
    buildTimeline(nailFocus, ZOOM_SCALE, canVideo);
  });
  mm.add('(max-width: 768px)', function () {
    buildTimeline(nailFocusMobile, ZOOM_SCALE_MOBILE, false);
  });
  mm.add('(min-width: 769px) and (pointer: coarse)', function () {
    buildTimeline(nailFocus, ZOOM_SCALE, false);
  });

  /* ---- Keep measurements honest ------------------------------------- */

  document.addEventListener('presse:ready', function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
