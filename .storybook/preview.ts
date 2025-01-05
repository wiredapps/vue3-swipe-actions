import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";
import SwipeOut from "../src/components/SwipeOut.vue";

setup((app) => {
  app.component("SwipeOut", SwipeOut);
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
