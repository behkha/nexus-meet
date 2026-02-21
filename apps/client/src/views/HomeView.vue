<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <JoinMeet />
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
const colorMode = useColorMode();
colorMode.value = 'dark'

import AppSidebar from "#/components/home/AppSidebar.vue";
import JoinMeet from "#/components/meet/JoinMeet.vue";

import { SidebarProvider, SidebarInset } from "#/components/ui/sidebar";
</script>
