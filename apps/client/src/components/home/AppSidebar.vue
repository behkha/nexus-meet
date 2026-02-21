<template>
  <Sidebar class="w-80" collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child class="hover:bg-transparent">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                  @click="open = true"
                >
                  <GalleryVerticalEnd class="size-4" />
                </div>
                <div class="flex flex-col gap-0.5 leading-none">
                  <span class="font-medium">Nexus Meet</span>
                </div>
              </div>
              <SidebarTrigger />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <MeetList v-show="open" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import NavUser from "./NavUser.vue";
import MeetList from "#/components/meet/MeetList.vue";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "#/components/ui/sidebar";

import { GalleryVerticalEnd } from "lucide-vue-next";

const { open } = useSidebar();
</script>
