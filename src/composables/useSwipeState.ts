import { ref, type Ref } from "vue";

export interface SwipeState {
  innerRevealed: Ref<string | boolean>;
  isActive: Ref<boolean>;
  leftActionsWidth: Ref<number>;
  rightActionsWidth: Ref<number>;
  startLeft: Ref<number>;
  timer: Ref<number | undefined>;
  frame: Ref<number | undefined>;
  contentRef: Ref<HTMLElement | null>;
  leftRef: Ref<HTMLElement | null>;
  rightRef: Ref<HTMLElement | null>;
  elRef: Ref<HTMLElement | null>;
}

export function useSwipeState(initialRevealed: string | boolean = false) {
  const state: SwipeState = {
    innerRevealed: ref(initialRevealed),
    isActive: ref(false),
    leftActionsWidth: ref(0),
    rightActionsWidth: ref(0),
    startLeft: ref(0),
    timer: ref(undefined),
    frame: ref(undefined),
    contentRef: ref(null),
    leftRef: ref(null),
    rightRef: ref(null),
    elRef: ref(null),
  };

  return state;
}
