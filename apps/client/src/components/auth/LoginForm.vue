<template>
  <AuthLayout>
    <div :class="cn('flex flex-col gap-6', props.class)">
      <Card class="overflow-hidden p-0">
        <CardContent class="grid p-0 md:grid-cols-2">
          <form class="p-6 md:p-8">
            <FieldGroup>
              <div class="flex flex-col items-center gap-2 text-center">
                <h1 class="text-2xl font-bold">Welcome back</h1>
                <p class="text-muted-foreground text-balance">
                  Login to your Acme Inc account
                </p>
              </div>
              <Field>
                <GoogleLogin :callback="handleGoogleLogin" />
              </Field>
              <FieldSeparator
                class="*:data-[slot=field-separator-content]:bg-card"
              >
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel for="email"> Email </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <Button type="submit"> Login </Button>
              </Field>
              <FieldDescription class="text-center">
                Don't have an account?
                <a href="#"> Sign up </a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div class="bg-muted relative hidden md:block">
            <img
              src="https://img.freepik.com/premium-photo/cool-stylish-british-hipster-cat-with-fashionable-vintage-round-sunglasses-black-hat-studio-gray-background-creative-idea-fashion_338491-12633.jpg?semt=ais_user_personalization&w=740&q=80"
              alt="Image"
              class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription class="px-6 text-center">
        By clicking continue, you agree to our
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { HTMLAttributes } from "vue";
import { cn } from "#/lib/utils";
import { toast } from "#/utils/toast";

import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

import { useAuthStore } from "#/stores/auth";
const authStore = useAuthStore();

import { GoogleLogin } from "vue3-google-login";
import AuthLayout from "./AuthLayout.vue";

import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const loading = ref(false);

async function handleGoogleLogin(data: { credential: string }) {
  try {
    loading.value = true;
    await authStore.loginWithGoogle(data.credential);
    const redirectPath = route.query?.redirect ?? "/";
    router.replace({
      path: redirectPath as string,
    });
    toast.success("Logged in successfully!");
  } catch (error: any) {
    toast.error(error?.message || "Login failed!");
  } finally {
    loading.value = false;
  }
}
</script>
