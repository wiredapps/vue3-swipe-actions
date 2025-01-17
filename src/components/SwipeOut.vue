<script setup lang="ts">
import { ref, watch, onBeforeUnmount, useSlots, type Ref, type VNodeRef } from "vue";
// @ts-ignore
import vTouchPan from "../directives/touch-horizontal-pan";
import { translateX } from "../utils/translateX";
import { areEqual } from "../utils/areEqual";

interface PanEvent {
  evt: Event;
  position: { left: number; top: number };
  direction: string;
  isFirst: boolean;
  isFinal: boolean;
  isMouse: boolean;
  duration: number;
  distance: { x: number; y: number };
  offset: { x: number; y: number };
  delta: { x: number; y: number };
}

export interface SwipeOutProps {
  threshold?: number;
  revealed?: string | boolean;
  disabled?: boolean;
  passiveListeners?: boolean;
}

const props = withDefaults(defineProps<SwipeOutProps>(), {
  threshold: 45,
  revealed: false,
  disabled: false,
  passiveListeners: false,
});

const emit = defineEmits<{
  "update:revealed": [value: "left" | "right" | false]
  active: [value: boolean]
  closed: [void]
  revealed: [value: { side: "left" | "right"; close: () => void }]
  leftRevealed: [value: { close: () => void }]
  rightRevealed: [value: { close: () => void }]
}>();

const slots = useSlots();

const innerRevealed = ref(props.revealed || false);
const isActive = ref(false);
const leftActionsWidth = ref(0);
const rightActionsWidth = ref(0);
const startLeft = ref(0);
const timer: Ref<number | undefined> = ref();
const frame: Ref<number | undefined> = ref();
const contentRef: VNodeRef = ref(null);
const leftRef: VNodeRef = ref(null);
const rightRef: VNodeRef = ref(null);
const elRef: VNodeRef = ref(null);

watch(
  () => props.revealed,
  (val) => {
    if (innerRevealed.value === val) return;
    // TODO this smells of messy types.
    reveal(val as "left" | "right" | false, true);
  }
);

const close = () => {
  if (isActive.value) return;
  reveal(false, true);
};

const revealLeft = () => {
  if (isActive.value || !leftRef.value) return;
  reveal("left", true);
};

const revealRight = () => {
  if (isActive.value || !rightRef.value) return;
  reveal("right", true);
};

defineExpose({
  close,
  revealLeft,
  revealRight,
});

const distanceSwiped = () => {
  const contentRect = contentRef.value.getBoundingClientRect();
  const elementRect = elRef.value.getBoundingClientRect();
  return contentRect.left - elementRect.left - elRef.value.clientLeft;
};

const onPan = (pan: PanEvent) => {
  if (props.disabled) return null;

  if (pan.isFirst) return startListener(pan);

  if (!isActive.value) return null;

  if (pan.isFinal) return stopListener(pan);

  return swipeListener(pan);
};

const startListener = ({ distance }: PanEvent) => {
  elRef.value.classList.add("swipeout--no-transition");
  if (distance.y <= 5) {
    leftActionsWidth.value = leftRef.value ? leftRef.value.clientWidth : 0;
    rightActionsWidth.value = rightRef.value ? rightRef.value.clientWidth : 0;

    startLeft.value = distanceSwiped();
    isActive.value = true;
    emit("active", true);
    clearTimeout(timer.value);
  }
};

const swipeListener = ({ offset }: PanEvent) => {
  const newX = offset.x + startLeft.value;
  if (!slots.left && newX > 0) return animateSlide(0);

  if (!slots.right && newX < 0) return animateSlide(0);

  return animateSlide(offset.x + startLeft.value);
};

const stopListener = ({ offset, distance }: PanEvent) => {
  elRef.value.classList.remove("swipeout--no-transition");
  isActive.value = false;
  emit("active", false);
  const newX = startLeft.value + offset.x;

  if (
    (startLeft.value === 0 && Math.abs(newX) <= props.threshold) ||
    (distance.x >= props.threshold &&
      ((startLeft.value > 0 && distance.x < leftActionsWidth.value) ||
        (startLeft.value < 0 && distance.x < rightActionsWidth.value)))
  ) {
    return reveal(false);
  }
  return reveal(newX > 0 ? "left" : "right");
};

const reveal = (dir: "left" | "right" | false, recalculateWidth?: boolean) => {
  if (isActive.value && areEqual(innerRevealed.value, dir)) {
    return;
  }

  const refs = { left: leftRef, right: rightRef };

  if (dir && !refs[dir]) {
    dir = false;
  }

  innerRevealed.value = dir;
  emit("update:revealed", dir);

  if (!dir) {
    animateSlide(0);
    emit("closed");
    return;
  }

  if (dir === "left" && leftRef.value) {
    leftActionsWidth.value = recalculateWidth
      ? leftRef.value.clientWidth
      : leftActionsWidth.value;
    animateSlide(leftActionsWidth.value);
    emit("revealed", { side: "left", close });
    emit("leftRevealed", { close });
    return;
  }

  if (dir === "right" && rightRef.value) {
    rightActionsWidth.value = recalculateWidth
      ? rightRef.value.clientWidth
      : rightActionsWidth.value;
    animateSlide(-rightActionsWidth.value);
    emit("revealed", { side: "right", close });
    emit("rightRevealed", { close });
  }
};

const shiftLeftActions = (newX: number) => {
  if (!slots.left) return;

  if (newX < 0) newX = 0;

  const actions = leftRef.value;
  const actionsWidth = leftActionsWidth.value;

  const progress = 1 - Math.min(newX / actionsWidth, 1);
  const deltaX = Math.min(newX, actionsWidth);

  const { children } = actions;
  const { length } = children;
  for (let i = 0; i < length; i++) {
    const child = children[i];
    const offsetLeft = actionsWidth - child.offsetLeft - child.offsetWidth;
    child.style.transform = translateX(deltaX + offsetLeft * progress);

    if (length > 1) child.style.zIndex = `${length - i}`;
  }
};

const shiftRightActions = (newX: number) => {
  if (!slots.right) return;

  if (newX > 0) newX = 0;

  const actions = rightRef.value;

  const actionsWidth = rightActionsWidth.value;

  const progress = 1 + Math.max(newX / actionsWidth, -1);
  const deltaX = Math.max(newX, -actionsWidth);
  const { children } = actions;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    child.style.transform = translateX(deltaX - child.offsetLeft * progress);
  }
};

const animateSlide = (to: number) => {
  if (frame.value !== undefined) {
    cancelAnimationFrame(frame.value);
  }

  frame.value = requestAnimationFrame(() => {
    contentRef.value.style.transform = translateX(to);
    shiftLeftActions(to);
    shiftRightActions(to);
  });
};

onBeforeUnmount(() => {
  clearTimeout(timer.value);

  if (frame.value !== undefined) {
    cancelAnimationFrame(frame.value);
  }
});
</script>

<template>
  <div ref="elRef" :class="['swipeout', { 'swipeout--disabled': disabled }]">
    <div v-if="$slots.left" ref="leftRef" class="swipeout-left">
      <slot name="left" :close="close"></slot>
    </div>

    <div v-if="$slots.right" ref="rightRef" class="swipeout-right">
      <slot name="right" :close="close"></slot>
    </div>

    <div ref="contentRef" class="swipeout-content" v-touch-pan="!disabled && ($slots.left || $slots.right)
        ? {
          handler: onPan,
          horizontal: true,
          mouse: true,
          prevent: !passiveListeners,
          mousePrevent: true,
        }
        : undefined
      ">
      <slot :revealLeft="revealLeft" :revealRight="revealRight" :disabled="disabled" :close="close"
        :revealed="innerRevealed"></slot>
    </div>
  </div>
</template>

<style>
.swipeout {
  position: relative;
  overflow: hidden;
  display: flex;
}

.swipeout .swipeout-left,
.swipeout .swipeout-right {
  position: absolute;
  height: 100%;
  display: flex;
  z-index: 1;
}

.swipeout .swipeout-left {
  left: 0;
  transform: translateX(-100%);
}

.swipeout .swipeout-right {
  right: 0;
  transform: translateX(100%);
}

.swipeout .swipeout-content,
.swipeout .swipeout-action {
  transition: transform 0.2s;
  will-change: transform;
}

.swipeout.swipeout--no-transition .swipeout-content,
.swipeout.swipeout--no-transition .swipeout-action {
  transition: none !important;
}

.swipeout .swipeout-content {
  width: 100%;
}

.swipeout-non-selectable {
  user-select: none !important;
}

.swipeout-no-pointer-events {
  pointer-events: none !important;
}

/* SwipeList */

.swipeout-list {
  display: flex;
  flex-direction: column;
}

.swipeout-list-item {
  flex: 1;
}
</style>
