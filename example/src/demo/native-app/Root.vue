<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <!-- 用应用所属的父路由作为缓存身份，独立子页切换继续保留同一 App。 -->
    <KeepAlive><component :is="Component" :key="route.matched[0]?.name ?? route.path" /></KeepAlive>
  </RouterView>
</template>
