<template>
  <div class="unknown-block">
    <a-spin :indicator="indicator" />
  </div>
</template>

<script setup lang="ts">
import { LoadingOutlined } from "@ant-design/icons-vue";
import { h } from "vue";

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: "14px",
  },
  spin: true,
});
</script>
