<script setup lang="ts">
import SwipeOut from "./components/SwipeOut.vue";
</script>

<template>
  Swipe!
  <SwipeOut>
    <template v-slot>Default scope text</template>
    <template v-slot:right>
      <button>Right</button>
    </template>
  </SwipeOut>
</template>

<style scoped></style>
