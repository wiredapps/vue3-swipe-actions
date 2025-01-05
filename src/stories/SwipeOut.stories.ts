import type { Meta, StoryObj } from "@storybook/vue3";

import SwipeOut from "../components/SwipeOut.vue";

const meta = {
  title: "Example/SwipeOut",
  component: SwipeOut,
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof SwipeOut>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
  render: () => {
    return {
      methods: {
        remove(item) {
          console.log(item);
        },
      },
      template: `
        <SwipeOut>
          <template #left="{ item, close, index }">
            <div class="swipeout-action red" @click="remove(item)">
              Left
            </div>
            <div class="swipeout-action purple" @click="close">
              Close
            </div>
          </template>
          <template #right>
            <div style="background-color: blue; color: white; padding: 10px;">Right</div>
          </template>
          <div style="background-color: green; color: white; padding: 10px;">Content</div>
        </SwipeOut>
      `,
    };
  },
};
