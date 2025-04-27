import { translateX } from "../utils/translateX";
import type { SwipeState } from "./useSwipeState";

export function useSwipeAnimation(state: SwipeState) {
  const getSlotWidth = (slotRef: HTMLElement | null) => {
    return slotRef ? slotRef.offsetWidth : 0;
  };

  const animateSlide = (to: number) => {
    if (state.frame.value !== undefined) {
      cancelAnimationFrame(state.frame.value);
    }

    state.frame.value = requestAnimationFrame(() => {
      if (state.elRef.value) {
        const leftWidth = getSlotWidth(state.leftRef.value);
        const rightWidth = getSlotWidth(state.rightRef.value);

        // Limit the swipe distance to the size of the respective slot
        if (to > 0) {
          to = Math.min(to, leftWidth + leftWidth / 2);
        } else if (to < 0) {
          to = Math.max(to, -(rightWidth + rightWidth / 2));
        }

        state.elRef.value.style.transform = translateX(to);
      }
    });
  };

  return {
    animateSlide,
  };
}
