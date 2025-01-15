<template>
  <div id="app">
    <swipe-list
      ref="list"
      class="card"
      :disabled="!enabled"
      :items="mockSwipeList[page]"
      item-key="id"
      v-model:revealed="revealed"
      :item-disabled="({ disabled }) => disabled"
      @closed="setLastEvent('closed', $event)"
      @leftRevealed="setLastEvent('leftRevealed', $event)"
      @rightRevealed="setLastEvent('rightRevealed', $event)"
    >
      <template v-slot="{ item, index, revealed, disabled }">
        <div ref="content" class="card-content" @click.native="itemClick(item)">
          <h2>{{ item.title }}</h2>
          <p>
            <b>id:</b> {{ item.id }} <b>description:</b> {{ item.description }}
            <b>revealed:</b> {{ revealed || "false" }} <b>disabled:</b> {{ disabled }}
          </p>
          <b>index:</b><span> {{ index }}</span>
          <input :id="`${index}disabled`" v-model="item.disabled" type="checkbox" />
          <label :for="`${index}disabled`">Disabled</label>
        </div>
      </template>
      <template v-slot:left="{ item, close }">
        <div class="swipeout-action red" title="remove" @click="remove(item)">
          <i class="fa fa-trash"></i>
        </div>
        <div class="swipeout-action purple" @click="close">
          <i class="fa fa-close"></i>
        </div>
      </template>
      <template v-slot:right="{}">
        <div class="swipeout-action blue">
          <i class="fa fa-heart"></i>
        </div>
        <div class="swipeout-action green">
          <i class="fa fa-heart"></i>
        </div>
      </template>
      <template v-slot:empty>
        <div>list is empty ( filtered or just empty )</div>
      </template>
    </swipe-list>
    <div class="toolbar">
      <div class="toolbar-section">
        <p>
          <button @click="revealFirstLeft">reveal 1st left</button>
          <button @click="revealFirstRight">reveal 1st right</button>
          <button @click="closeFirst">close 1st</button>
          <button @click="closeAll">close all</button>
          <button @click="page = Math.max(page - 1, 0)">prev</button>
          <button @click="page = Math.min(page + 1, 1)">next</button>
        </p>
      </div>
      <div class="toolbar-section--center" />
      <div class="toolbar-section">
        <small
          >revealed:
          {{
            Object.entries(revealed)
              .map(([index, side]) => `${index}: ${side}`)
              .join(", ")
          }}</small
        >
      </div>
      <div class="toolbar-section--center" />
      <div class="toolbar-section">
        <small
          >last event:
          <template v-if="lastEventDescription"
            >[<b>{{ lastEventDescription.name }}</b
            >] index: {{ lastEventDescription.index }} id:
            {{ lastEventDescription.id }}</template
          ><span v-else>none</span></small
        >
      </div>
    </div>
    <p>
      <small>
        <i>Press and hold [shift] to select text</i>
      </small>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import SwipeList from "./components/SwipeList.vue";

const enabled = ref(true);
const page = ref(0);
const revealed = ref<Record<string, string>>({});
const list = ref<InstanceType<typeof SwipeList> | null>(null);

const lastEventDescription = ref<{ name: string; index: number; id: string } | null>(
  null
);

const mockSwipeList = ref([
  [
    { id: "a", title: "Item 1", description: "some description", disabled: false },
    { id: "b", title: "Item 2", description: "some description", disabled: false },
    { id: "c", title: "Item 3", description: "some description", disabled: false },
  ],
  [
    { id: "d", title: "Item 4", description: "some description", disabled: false },
    { id: "e", title: "Item 5", description: "some description", disabled: false },
    { id: "f", title: "Item 6", description: "some description", disabled: false },
  ],
]);

const revealFirstRight = () => {
  list.value?.revealRight(0);
};

const revealFirstLeft = () => {
  list.value?.revealLeft(0);
};

const closeFirst = () => {
  list.value?.close(0);
};

const closeAll = () => {
  list.value?.close();
};

const remove = (item: any) => {
  mockSwipeList.value[page.value] = mockSwipeList.value[page.value].filter(
    (i: any) => i !== item
  );
};

const setLastEvent = (name: string, { item, index }: { item: any; index: number }) => {
  lastEventDescription.value = { name, index, id: item.id };
};

const itemClick = (e: any) => {
  console.log(e, "item click");
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== "Shift") return;
  enabled.value = false;
};

const onKeyUp = (e: KeyboardEvent) => {
  if (e.key !== "Shift") return;
  enabled.value = true;
};

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
});
</script>

<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");

/* app specific styles */

.swipeout-action {
  display: flex;
  align-items: center;
  padding: 0 3rem;
  cursor: pointer;
  left: 0;
}

/* https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/color/ */
.swipeout-action.blue {
  color: white;
  background-color: rgb(0, 122, 255);
}

.swipeout-action.blue:hover {
  background-color: darken(rgb(0, 122, 255), 5%);
}

.swipeout-action.purple {
  color: white;
  background-color: rgb(88, 86, 214);
}

.swipeout-action.purple:hover {
  background-color: darken(rgb(88, 86, 214), 5%);
}

.swipeout-action.red {
  color: white;
  background-color: rgb(255, 59, 48);
}

.swipeout-action.red:hover {
  background-color: darken(rgb(255, 59, 48), 5%);
}

.swipeout-action.green {
  color: white;
  background-color: rgb(76, 217, 100);
}

.swipeout-action.green:hover {
  background-color: darken(rgb(76, 217, 100), 5%);
}

.swipeout-list-item {
  flex: 1;
  border-bottom: 1px solid lightgray;
}

.swipeout-list-item:last-of-type {
  border-bottom: none;
}

.card {
  width: 100%;
  background-color: white;
  border-radius: 3px;
  box-shadow: none;
  border: 1px solid lightgray;
}

.card-content {
  padding: 1rem;
}

.transition-right {
  transform: translate3d(100%, 0, 0) !important;
}

.transition-left {
  transform: translate3d(-100%, 0, 0) !important;
}

.toolbar {
  display: flex;
  align-items: center;
}

.toolbar .toolbar-section {
  flex: 0 0 auto;
}

.toolbar .toolbar-section--center {
  flex: 1000 1 0%;
}
</style>
