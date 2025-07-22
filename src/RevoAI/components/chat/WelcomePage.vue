<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <div class="welcome-title">{{ title || "欢迎使用 Revo AI" }}</div>
      <div class="welcome-description">
        {{ description || "你可以随时问我任何问题~" }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<style lang="scss" scoped>
.welcome-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.welcome-content {
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.welcome-logo {
  margin-bottom: 24px;

  img {
    width: 64px;
    height: 64px;
  }

  .ai-icon {
    font-size: 64px;
    color: var(--color-primary);
  }
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-1);
}

.welcome-description {
  font-size: 16px;
  color: var(--color-text-2);
  margin-bottom: 32px;
  max-width: 80%;
}

.welcome-actions {
  margin-bottom: 48px;
}

.welcome-examples {
  width: 100%;

  .examples-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
    color: var(--color-text-1);
  }

  .examples-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  .example-item {
    padding: 12px 16px;
    background-color: var(--color-bg-2);
    border-radius: var(--border-radius-base);
    cursor: pointer;
    display: flex;
    align-items: center;
    text-align: left;
    transition: background-color var(--transition-duration);

    &:hover {
      background-color: var(--color-bg-3);
    }

    .message-icon {
      font-size: 16px;
      margin-right: 8px;
      color: var(--color-primary);
    }

    span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--color-text-2);
    }
  }
}
</style>
