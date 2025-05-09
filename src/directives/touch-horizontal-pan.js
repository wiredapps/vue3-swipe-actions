// adopted from https://github.com/eCollect/vue-swipe-actions/blob/a400c77c355f90334cfba3dfa3566847e1028a04/src/directives/touch-horizontal-pan.js
// adopted from https://github.com/quasarframework/quasar/blob/dev/quasar/src/directives/TouchPan.js
import { position, leftClick, listenOpts } from "../utils/event";
import { setObserver, removeObserver } from "../utils/touch-observer";

function getDirection(mod) {
  const none = mod.horizontal !== true && mod.vertical !== true;
  const dir = {
    all: none === true || (mod.horizontal === true && mod.vertical === true),
  };

  if (mod.horizontal === true || none === true) dir.horizontal = true;

  if (mod.vertical === true || none === true) dir.vertical = true;

  return dir;
}

function processChanges(evt, ctx, isFinal) {
  const pos = position(evt);
  let direction;
  const distX = pos.left - ctx.event.x;
  const distY = pos.top - ctx.event.y;
  const absDistX = Math.abs(distX);
  const absDistY = Math.abs(distY);

  if (ctx.direction.horizontal && !ctx.direction.vertical)
    direction = distX < 0 ? "left" : "right";
  else if (!ctx.direction.horizontal && ctx.direction.vertical)
    direction = distY < 0 ? "up" : "down";
  else if (absDistX >= absDistY) direction = distX < 0 ? "left" : "right";
  else direction = distY < 0 ? "up" : "down";

  return {
    evt,
    position: pos,
    direction,
    isFirst: ctx.event.isFirst,
    isFinal: isFinal === true,
    isMouse: ctx.event.mouse,
    duration: new Date().getTime() - ctx.event.time,
    distance: {
      x: absDistX,
      y: absDistY,
    },
    offset: {
      x: distX,
      y: distY,
    },
    delta: {
      x: pos.left - ctx.event.lastX,
      y: pos.top - ctx.event.lastY,
    },
  };
}

function shouldTrigger(ctx, changes) {
  if (ctx.direction.horizontal && ctx.direction.vertical) return true;

  if (ctx.direction.horizontal && !ctx.direction.vertical)
    return Math.abs(changes.delta.x) > 0;

  if (!ctx.direction.horizontal && ctx.direction.vertical)
    return Math.abs(changes.delta.y) > 0;

  return undefined;
}

export default {
  name: "touch-pan",

  beforeMount(el, binding) {
    if (!binding.value) {
      return;
    }

    // FIX to get around not having multiple modifiers in template
    binding.modifiers = binding.value;
    binding.value = binding.value.handler;

    const mouse = binding.modifiers.mouse === true;
    const mouseEvtPassive =
      binding.modifiers.mouseMightPrevent !== true &&
      binding.modifiers.mousePrevent !== true;
    const mouseEvtOpts =
      listenOpts.passive === undefined
        ? true
        : { passive: mouseEvtPassive, capture: true };
    const touchEvtPassive =
      binding.modifiers.mightPrevent !== true &&
      binding.modifiers.prevent !== true;
    const touchEvtOpts = touchEvtPassive ? listenOpts.passive : null;

    function handleEvent(evt, mouseEvent) {
      if (mouse && mouseEvent) {
        if (binding.modifiers.mouseStop) evt.stopPropagation();
        if (binding.modifiers.mousePrevent) evt.preventDefault();
      } else {
        if (binding.modifiers.stop) evt.stopPropagation();
        if (binding.modifiers.prevent) evt.preventDefault();
      }
    }

    const ctx = {
      handler: binding.value,
      direction: getDirection(binding.modifiers),

      mouseStart(evt) {
        if (leftClick(evt)) {
          document.addEventListener("mousemove", ctx.move, mouseEvtOpts);
          document.addEventListener("mouseup", ctx.mouseEnd, mouseEvtOpts);
          ctx.start(evt, true);
        }
      },

      mouseEnd(evt) {
        document.removeEventListener("mousemove", ctx.move, mouseEvtOpts);
        document.removeEventListener("mouseup", ctx.mouseEnd, mouseEvtOpts);
        ctx.end(evt);
      },

      start(evt, mouseEvent) {
        removeObserver(ctx);
        if (mouseEvent !== true) setObserver(el, evt, ctx);

        const pos = position(evt);

        ctx.event = {
          x: pos.left,
          y: pos.top,
          time: new Date().getTime(),
          mouse: mouseEvent === true,
          detected: false,
          abort: false,
          isFirst: true,
          isFinal: false,
          lastX: pos.left,
          lastY: pos.top,
        };
      },

      move(evt) {
        if (!ctx.event) return;

        if (ctx.event.abort === true) return;

        if (ctx.event.detected === true) {
          handleEvent(evt, ctx.event.mouse);

          const changes = processChanges(evt, ctx, false);
          if (shouldTrigger(ctx, changes)) {
            ctx.handler(changes);
            ctx.event.lastX = changes.position.left;
            ctx.event.lastY = changes.position.top;
            ctx.event.isFirst = false;
          }

          return;
        }

        const pos = position(evt);
        const distX = Math.abs(pos.left - ctx.event.x);
        const distY = Math.abs(pos.top - ctx.event.y);

        if (distX === distY) return;

        ctx.event.detected = true;

        if (
          ctx.direction.all === false &&
          (ctx.event.mouse === false || binding.modifiers.mouseAllDir !== true)
        )
          ctx.event.abort = ctx.direction.vertical
            ? distX > distY
            : distX < distY;

        if (ctx.event.abort !== true) {
          document.documentElement.style.cursor = "grabbing";
          document.body.classList.add("swipeout-no-pointer-events");
          document.body.classList.add("swipeout-non-selectable");
        }

        ctx.move(evt);
      },

      end(evt) {
        if (!ctx.event) return;

        if (ctx.event.mouse !== true) removeObserver(ctx);

        document.documentElement.style.cursor = "";
        document.body.classList.remove("swipeout-no-pointer-events");
        document.body.classList.remove("swipeout-non-selectable");

        if (
          ctx.event.abort === true ||
          ctx.event.detected !== true ||
          ctx.event.isFirst === true
        )
          return;

        handleEvent(evt, ctx.event.mouse);
        ctx.handler(processChanges(evt, ctx, true));
      },
    };

    if (el.__qtouchpan) {
      el.__qtouchpan_old = el.__qtouchpan;
    }

    el.__qtouchpan = ctx;

    if (mouse === true) {
      el.addEventListener("mousedown", ctx.mouseStart, mouseEvtOpts);
    }
    el.addEventListener("touchstart", ctx.start, touchEvtOpts);
    el.addEventListener("touchmove", ctx.move, touchEvtOpts);
    el.addEventListener("touchcancel", ctx.end, touchEvtOpts);
    el.addEventListener("touchend", ctx.end, touchEvtOpts);
  },

  updated(el, { oldValue, value, modifiers }) {
    const ctx = el.__qtouchpan;

    if (!value) {
      return;
    }

    if (oldValue !== value) {
      ctx.handler = value.handler;
    }

    if (
      value.horizontal !== ctx.direction.horizontal ||
      value.vertical !== ctx.direction.vertical
    ) {
      ctx.direction = getDirection(value);
    }
  },

  unmounted(el, binding) {
    const ctx = el.__qtouchpan_old || el.__qtouchpan;
    if (ctx !== undefined) {
      removeObserver(ctx);

      document.documentElement.style.cursor = "";
      document.body.classList.remove("swipeout-no-pointer-events");
      document.body.classList.remove("swipeout-non-selectable");

      const mouse = binding.modifiers.mouse === true;
      const mouseEvtPassive =
        binding.modifiers.mouseMightPrevent !== true &&
        binding.modifiers.mousePrevent !== true;
      const mouseEvtOpts =
        listenOpts.passive === undefined
          ? true
          : { passive: mouseEvtPassive, capture: true };
      const touchEvtPassive =
        binding.modifiers.mightPrevent !== true &&
        binding.modifiers.prevent !== true;
      const touchEvtOpts = touchEvtPassive ? listenOpts.passive : null;

      if (mouse === true) {
        el.removeEventListener("mousedown", ctx.mouseStart, mouseEvtOpts);
        document.removeEventListener("mousemove", ctx.move, mouseEvtOpts);
        document.removeEventListener("mouseup", ctx.mouseEnd, mouseEvtOpts);
      }
      el.removeEventListener("touchstart", ctx.start, touchEvtOpts);
      el.removeEventListener("touchmove", ctx.move, touchEvtOpts);
      el.removeEventListener("touchcancel", ctx.end, touchEvtOpts);
      el.removeEventListener("touchend", ctx.end, touchEvtOpts);

      delete el[el.__qtouchpan_old ? "__qtouchpan_old" : "__qtouchpan"];
    }
  },
};
