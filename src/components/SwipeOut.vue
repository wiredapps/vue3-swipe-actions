<script setup lang="ts">
import { watch, onBeforeUnmount, useSlots } from "vue";
// @ts-ignore
import vTouchPan from "../directives/touch-horizontal-pan";
import { useSwipeState } from "../composables/useSwipeState";
import { useSwipeAnimation } from "../composables/useSwipeAnimation";
import { useSwipeReveal } from "../composables/useSwipeReveal";
import { useSwipeGestures } from "../composables/useSwipeGestures";

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
  "update:revealed": [value: "left" | "right" | false];
  active: [value: boolean];
  closed: [void];
  revealed: [value: { side: "left" | "right"; close: () => void }];
  leftRevealed: [value: { close: () => void }];
  rightRevealed: [value: { close: () => void }];
}>();

const slots = useSlots();
const state = useSwipeState(props.revealed);

const { animateSlide } = useSwipeAnimation(state, slots);

const { reveal, close, revealLeft, revealRight } = useSwipeReveal(
  state,
  animateSlide,
  emit
);

const { onPan } = useSwipeGestures(
  state,
  animateSlide,
  reveal,
  props.threshold,
  slots,
  emit,
  props.disabled
);

watch(
  () => props.revealed,
  (val) => {
    if (state.innerRevealed.value === val) return;
    // TODO this smells of messy types.
    reveal(val as "left" | "right" | false, true);
  }
);

defineExpose({
  close,
  revealLeft,
  revealRight,
});

onBeforeUnmount(() => {
  clearTimeout(state.timer.value);

  if (state.frame.value !== undefined) {
    cancelAnimationFrame(state.frame.value);
  }
});
</script>

<template>
  <div
    :ref="state.elRef"
    :class="['swipeout', { 'swipeout--disabled': disabled }]"
  >
    <div
      v-if="$slots.left"
      :ref="state.leftRef"
      class="swipeout-left"
    >
      <slot
        name="left"
        :close="close"
      ></slot>
    </div>

    <div
      v-if="$slots.right"
      :ref="state.rightRef"
      class="swipeout-right"
    >
      <slot
        name="right"
        :close="close"
      ></slot>
    </div>

    <div
      :ref="state.contentRef"
      class="swipeout-content"
      v-touch-pan="
        !disabled && ($slots.left || $slots.right)
          ? {
              handler: onPan,
              horizontal: true,
              mouse: true,
              prevent: !passiveListeners,
              mousePrevent: true,
            }
          : undefined
      "
    >
      <slot
        :revealLeft="revealLeft"
        :revealRight="revealRight"
        :disabled="disabled"
        :revealed="state.innerRevealed"
        :close="close"
      ></slot>
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
