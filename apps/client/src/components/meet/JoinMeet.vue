<template>
  <div
    class="h-full overflow-hidden flex flex-col items-center justify-center relative text-center pb-24"
  >
    <div
      class="animate-float-glow absolute aspect-square bottom-0 translate-y-[80%] w-full rounded-full bg-[radial-gradient(ellipse_at_center,var(--primary),var(--primary))] blur-3xl opacity-30 z-1"
    />

    <h1
      class="scroll-m-20 text-center text-4xl font-medium tracking-tight text-balance"
    >
      Your AI Agent joins the <br />
      meeting with you!
    </h1>
    <p class="leading-6 mt-4 text-muted-foreground z-2 max-w-md text-sm">
      Capturing key points, verifying data, and preparing summaries <br />
      in real-time, so you can focus on the conversation.
    </p>
    <div class="flex flex-col sm:flex-row gap-2 mt-16 z-2">
      <Dialog>
        <DialogTrigger>
          <Button class="w-full"> New Meeting </Button>
        </DialogTrigger>
        <DialogScrollContent>
          <DialogHeader>
            <DialogTitle>New Meeting</DialogTitle>
            <DialogDescription>
              Do you want to start a new meeting? Your AI Agent will be ready to
              assist you!
            </DialogDescription>
          </DialogHeader>

          <form id="new-meeting-form" @submit="onSubmit">
            <FieldGroup>
              <VeeField v-slot="{ field, errors }" name="title">
                <Field :data-invalid="!!errors.length">
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    v-bind="field"
                    placeholder="Enter meeting title"
                    :aria-invalid="!!errors.length"
                  />
                  <FieldError v-if="errors.length" :errors />
                </Field>
              </VeeField>
              <VeeField v-slot="{ field, errors }" name="description">
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    v-bind="field"
                    placeholder="Enter meeting description (optional)"
                    :aria-invalid="!!errors.length"
                  />
                  <FieldError v-if="errors.length" :errors />
                </Field>
              </VeeField>
              <VeeField v-slot="{ field, errors }" name="accessType">
                <Field>
                  <FieldSet :data-invalid="!!errors.length">
                    <FieldLegend>Access Type</FieldLegend>
                    <FieldDescription>
                      Choose how participants can join your meeting
                    </FieldDescription>
                    <RadioGroup
                      :name="field.name"
                      :model-value="field.value"
                      :aria-invalid="!!errors.length"
                      @update:model-value="field.onChange"
                    >
                      <FieldLabel
                        v-for="item in accessTypes"
                        :key="item.value"
                        :for="`new-meeting-access-type-${item.value}`"
                      >
                        <Field orientation="horizontal">
                          <RadioGroupItem
                            :id="`new-meeting-access-type-${item.value}`"
                            :value="item.value"
                            :aria-invalid="!!errors.length"
                          />
                          <FieldContent>
                            <FieldTitle>{{ item.label }}</FieldTitle>
                            <FieldDescription>
                              {{ item.description }}
                            </FieldDescription>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    </RadioGroup>
                  </FieldSet>
                </Field>
              </VeeField>
              <VeeField
                v-if="values.accessType === 'password'"
                v-slot="{ field, errors }"
                name="password"
              >
                <Field :data-invalid="!!errors.length">
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    v-bind="field"
                    placeholder="Enter meeting password"
                    type="password"
                    :aria-invalid="!!errors.length"
                  />
                  <FieldError v-if="errors.length" :errors />
                </Field>
              </VeeField>
            </FieldGroup>
          </form>

          <DialogFooter>
            <Field orientation="horizontal" class="justify-end">
              <Button type="button" variant="outline" @click="resetForm()">
                Reset
              </Button>
              <Button type="submit" form="new-meeting-form">
                Create Meeting
              </Button>
            </Field>
          </DialogFooter>
        </DialogScrollContent>
      </Dialog>

      <Input
        v-model="roomName"
        class="min-w-sm"
        placeholder="Enter Room Name"
      />
      <Button :variant="roomName ? 'outline' : 'ghost'" :disabled="!roomName">
        Join
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { toast } from "#/utils/toast";
import { MeetingService } from "#/services/meeting.service";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm, Field as VeeField } from "vee-validate";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogScrollContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldGroup,
  FieldContent,
  FieldSet,
  FieldLegend,
  FieldTitle,
} from "#/components/ui/field";
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group";
import {
  IMeetingAccessType,
  type INewMeetingPayload,
} from "#/types/meeting.types";

const accessTypes = [
  {
    value: "open",
    label: "Open",
    description: "Anyone can join without restrictions.",
  },
  {
    value: "request",
    label: "Request Access",
    description: "Participants must request permission to join.",
  },
  {
    value: "password",
    label: "Password Protected",
    description: "Participants need to enter a password to join the meeting.",
  },
];

const loading = ref(false);
const roomName = ref("");

const newMeetingFormSchema: z.ZodType<INewMeetingPayload> = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().max(255).optional(),
  accessType: z.enum([
    IMeetingAccessType.OPEN,
    IMeetingAccessType.REQUEST,
    IMeetingAccessType.PASSWORD,
  ]),
  password: z.string().optional(),
});

const { values, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(newMeetingFormSchema),
});

const onSubmit = handleSubmit(async (data) => {
  try {
    loading.value = true;
    const response = await MeetingService.createMeet(data);
    console.log("Meeting created:", response);
  } catch (error) {
    toast.error("Failed to create meeting. Please try again.");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@keyframes float-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
  25% {
    transform: scale(1.1);
    opacity: 0.35;
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.40;
    border-radius: 40% 50% 40% 60% / 40% 40% 60% 50%;
  }
  75% {
    transform: scale(1.1);
    opacity: 0.35;
    border-radius: 70% 30% 50% 50% / 30% 50% 70% 40%;
  }
}

.animate-float-glow {
  animation: float-glow 12s ease-in-out infinite;
}
</style>
