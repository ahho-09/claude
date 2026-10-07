(function () {
  "use strict";

  var section = document.querySelector(".color-reveal");
  var items = Array.prototype.slice.call(document.querySelectorAll(".color-circle__item"));
  var heading = document.getElementById("colorHeading");
  var hint = document.getElementById("scrollHint");

  if (!section || !items.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var N = items.length;
  var IDLE_R = 70;
  var EXPLODE_R = 190;
  var EXPLODE_START = 0.18;
  var EXPLODE_END = 0.38;
  var SPIN_SPEED = reduceMotion ? 0 : 0.22; // degrees per frame

  var angle = 0;
  var frozenAngle = null;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return Math.min(1, Math.max(0, v)); }

  function getProgress() {
    var rect = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    var scrolled = -rect.top;
    return clamp01(scrolled / total);
  }

  function render() {
    var progress = getProgress();

    if (progress < EXPLODE_START) {
      angle += SPIN_SPEED;
      frozenAngle = angle;
    } else if (frozenAngle === null) {
      frozenAngle = angle;
    }

    var useAngle = progress < EXPLODE_START ? angle : frozenAngle;

    var radius = IDLE_R;
    if (progress >= EXPLODE_START) {
      var explodeT = clamp01((progress - EXPLODE_START) / (EXPLODE_END - EXPLODE_START));
      radius = lerp(IDLE_R, EXPLODE_R, explodeT);
    }

    var activeIndex = -1;

    items.forEach(function (item, i) {
      var a = (useAngle + (i * 360) / N) * (Math.PI / 180);
      var x = Math.cos(a) * radius;
      var y = Math.sin(a) * radius;

      var scale = 0.78;
      var opacity = 0.55;
      var active = false;

      if (progress >= EXPLODE_END) {
        var segDuration = (1 - EXPLODE_END) / N;
        var segStart = EXPLODE_END + i * segDuration;
        var t = clamp01((progress - segStart) / segDuration);
        scale = lerp(0.85, 1.22, t);
        opacity = lerp(0.5, 1, t);
        if (t > 0.5) {
          active = true;
          activeIndex = i;
        }
      } else if (progress >= EXPLODE_START) {
        var midT = clamp01((progress - EXPLODE_START) / (EXPLODE_END - EXPLODE_START));
        scale = lerp(0.78, 0.85, midT);
      }

      item.style.transform =
        "translate(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px) translate(-50%, -50%) scale(" + scale.toFixed(3) + ")";
      item.style.opacity = opacity.toFixed(2);
      item.classList.toggle("is-active", active);
    });

    heading.textContent = activeIndex >= 0 ? items[activeIndex].dataset.color : "Une teinte pour chaque intérieur";
    hint.classList.toggle("is-hidden", progress > 0.05);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
