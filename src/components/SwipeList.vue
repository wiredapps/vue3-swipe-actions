<template>
  <div :class="['swipeout-list', { 'swipeout--disabled': disabled }]">
    <SwipeOut
      v-for="(item, index) in items"
      :key="index"
      ref="refs"
      class="swipeout-list-item"
      :disabled="disabled || itemDisabled(item)"
      :threshold="threshold"
      :revealed="innerRevealed[index]"
      :passiveListeners="passiveListeners"
      @revealed="(event) => _onReveal(item, index, event)"
      @leftRevealed="
        (event) => $emit('leftRevealed', { index, item, close: event.close })
      "
      @rightRevealed="
        (event) => $emit('rightRevealed', { index, item, close: event.close })
      "
      @closed="(event) => _onClose(item, index, event)"
      @active="$emit('active', $event)"
    >
      <template
        v-if="slots.default"
        #default="{ close, disabled, revealLeft, revealRight, revealed }"
      >
        <div ref="itemsContent" @click="$emit('swipeout:click', item)">
          <slot
            :item="item"
            :index="index"
            :close="close"
            :disabled="disabled"
            :revealed="revealed"
            :revealLeft="revealLeft"
            :revealRight="revealRight"
          />
        </div>
      </template>
      <template v-if="slots.left" #left="{ close }">
        <slot name="left" :item="item" :close="close" :index="index" />
      </template>
      <template v-if="slots.right" #right="{ close }">
        <slot name="right" :item="item" :close="close" :index="index" />
      </template>
    </SwipeOut>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, withDefaults, useSlots } from "vue";
import SwipeOut from "./SwipeOut.vue";

interface SwipeListProps<A> {
  items: A[];
  itemKey?: string;
  threshold?: number;
  revealed?: Record<string, A>;
  disabled?: boolean;
  itemDisabled?: (item: A) => boolean;
  passiveListeners?: boolean;
}

const props = withDefaults(defineProps<SwipeListProps<any>>(), {
  threshold: 45,
  disabled: false,
  itemDisabled: () => false,
  passiveListeners: false,
});

const emit = defineEmits([
  "update:revealed",
  "revealed",
  "closed",
  "leftRevealed",
  "rightRevealed",
  "active",
  "swipeout:click",
]);

const slots = useSlots();

const innerRevealed = ref(props.revealed || {});
const itemRefs = ref<(InstanceType<typeof SwipeOut> | null)[]>([]);

watch(
  () => props.revealed,
  (val) => {
    innerRevealed.value = val || {};
  }
);

watch(
  () => props.items,
  () => {
    _emitRevealed({});
  }
);

defineExpose({
  revealRight(index: number) {
    if (itemRefs.value[index]) {
      itemRefs.value[index]?.revealRight();
    }
  },
  revealLeft(index: number) {
    if (itemRefs.value[index]) {
      itemRefs.value[index]?.revealLeft();
    }
  },
  close(index?: number) {
    if (!itemRefs.value) return;

    if (index === undefined) return itemRefs.value.forEach((i) => i?.close());

    if (!itemRefs.value[index]) return;

    return itemRefs.value[index]?.close();
  },
  isRevealed(index: number) {
    return innerRevealed.value[index] || false;
  },
});

// private
const _onReveal = (item: any, index: number, event: any) => {
  emit("revealed", {
    index,
    item,
    side: event.side,
    close: event.close,
  });
  _emitRevealed({
    ...innerRevealed.value,
    [index]: event.side,
  });
};

const _onClose = (item: any, index: number, event: any) => {
  emit("closed", {
    index,
    item,
  });
  const { [index]: omit, ...newRevealed } = innerRevealed.value;
  _emitRevealed(newRevealed);
};

const _emitRevealed = (val: any) => {
  if (props.revealed !== undefined) {
    emit("update:revealed", val);
    return;
  }
  innerRevealed.value = val;
};
</script>
