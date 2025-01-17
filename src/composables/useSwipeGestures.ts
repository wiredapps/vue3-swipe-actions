import type { SwipeState } from "./useSwipeState";
import type { Slots } from "vue";

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

export function useSwipeGestures(
  state: SwipeState,
  animateSlide: (to: number) => void,
  reveal: (dir: "left" | "right" | false, recalculateWidth?: boolean) => void,
  threshold: number,
  slots: Slots,
  emit: (event: "active", value: boolean) => void,
  disabled: boolean
) {
  const distanceSwiped = () => {
    const contentRect = state.contentRef.value!.getBoundingClientRect();
    const elementRect = state.elRef.value!.getBoundingClientRect();
    return contentRect.left - elementRect.left - state.elRef.value!.clientLeft;
  };

  const startListener = ({ distance }: PanEvent) => {
    state.elRef.value?.classList.add("swipeout--no-transition");
    if (distance.y <= 5) {
      state.leftActionsWidth.value = state.leftRef.value
        ? state.leftRef.value.clientWidth
        : 0;
      state.rightActionsWidth.value = state.rightRef.value
        ? state.rightRef.value.clientWidth
        : 0;

      state.startLeft.value = distanceSwiped();
      state.isActive.value = true;
      emit("active", true);
      clearTimeout(state.timer.value);
    }
  };

  const swipeListener = ({ offset }: PanEvent) => {
    const newX = offset.x + state.startLeft.value;
    if (!slots.left && newX > 0) return animateSlide(0);
    if (!slots.right && newX < 0) return animateSlide(0);
    return animateSlide(newX);
  };

  const stopListener = ({ offset, distance }: PanEvent) => {
    state.elRef.value?.classList.remove("swipeout--no-transition");
    state.isActive.value = false;
    emit("active", false);
    const newX = state.startLeft.value + offset.x;

    if (
      (state.startLeft.value === 0 && Math.abs(newX) <= threshold) ||
      (distance.x >= threshold &&
        ((state.startLeft.value > 0 &&
          distance.x < state.leftActionsWidth.value) ||
          (state.startLeft.value < 0 &&
            distance.x < state.rightActionsWidth.value)))
    ) {
      return reveal(false);
    }
    return reveal(newX > 0 ? "left" : "right");
  };

  const onPan = (pan: PanEvent) => {
    if (disabled) return null;
    if (pan.isFirst) return startListener(pan);
    if (!state.isActive.value) return null;
    if (pan.isFinal) return stopListener(pan);
    return swipeListener(pan);
  };

  return {
    onPan,
  };
}
