<script setup lang="ts">
import SwipeOut from "./components/SwipeOut.vue";
</script>

<template>
  <h1>Swipe Actions Demo</h1>

  <SwipeOut class="card">
    <template v-slot>
      <div ref="content" class="card-content">Swipe!</div>
    </template>

    <template v-slot:left="{ close }">
      <div class="swipeout-action red" title="remove" @click="close">
        <!-- place icon here or what ever you want -->
        <i class="fa fa-trash"></i>
      </div>
      <div class="swipeout-action purple" @click="close">
        <!-- place icon here or what ever you want -->
        <i class="fa fa-close"></i>
      </div>
    </template>

    <template v-slot:right="{}">
      <div class="swipeout-action blue">
        <!-- place icon here or what ever you want -->
        <i class="fa fa-heart"></i>
      </div>
      <div class="swipeout-action green">
        <!-- place icon here or what ever you want -->
        <i class="fa fa-heart"></i>
      </div>
    </template>
    <template v-slot:empty>
      <div>
        <!-- change mockSwipeList to an empty array to see this slot in action  -->
        list is empty ( filtered or just empty )
      </div>
    </template>
  </SwipeOut>
</template>

<style scoped>
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
