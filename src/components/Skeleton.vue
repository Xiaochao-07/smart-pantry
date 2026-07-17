<script setup lang="ts">
defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="['skeleton', $props.class]">
    <div class="invisible">
      <slot />
    </div>
  </div>
</template>
