<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { object, string } from "yup";
import type { EditProfileData } from "~~/shared/types/user";

const props = defineProps<{
  name: string;
  email: string;
  avatar_url?: string;
  birth_date?: string;
  isEdit: boolean;
}>();

const userSchema = object({
  name: string().trim().required().min(2).max(20),
  email: string().trim().email().required(),
  birth_date: string().optional(),
});

const formErrors = ref<Record<string, string>>({});

const localName = ref(props.name ?? "");
const localEmail = ref(props.email ?? "");
const localAvatar = ref(props.avatar_url ?? "");
const isUploadingAvatar = ref(false);
const avatarError = ref("");
const avatarInputRef = ref<HTMLInputElement | null>(null);
const getTodayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const normalizeBirthDate = (value?: string) => {
  if (!value) return "";
  if (value.includes(".")) {
    const [day, month, year] = value.split(".");
    if (year && month && day) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }
  return value;
};

const localBirthDate = ref(normalizeBirthDate(props.birth_date));
const todayIso = computed(() => getTodayIso());
watch(
  () => props.birth_date,
  (value) => {
    localBirthDate.value = normalizeBirthDate(value);
  },
);
watch(
  () => props.avatar_url,
  (value) => {
    localAvatar.value = value ?? "";
  },
);

const emit = defineEmits<{
  (e: "save", payload: EditProfileData): void;
  (e: "avatar-updated", value: string): void;
  (e: "update:isEdit", value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.isEdit,
  set: (value: boolean) => emit("update:isEdit", value),
});

const validateForm = async () => {
  try {
    await userSchema.validate(
      {
        name: localName.value,
        email: localEmail.value,
        birth_date: localBirthDate.value || undefined,
      },
      { abortEarly: false },
    );

    formErrors.value = {};
    return true;
  } catch (err: any) {
    if (err.inner) {
      const errors: { [key: string]: string } = {};
      err.inner.forEach((e: any) => {
        if (e.path) errors[e.path] = e.message;
      });
      formErrors.value = errors;
    }
    return false;
  }
};

const saveChanges = async () => {
  const isValid = await validateForm();
  if (!isValid) return;

  const trimmedName = localName.value.trim();
  const trimmedEmail = localEmail.value.trim();

  localName.value = trimmedName;
  localEmail.value = trimmedEmail;

  emit("save", {
    name: trimmedName,
    email: trimmedEmail,
    birth_date: localBirthDate.value || undefined,
  });

  isOpen.value = false;
};

const handleClose = () => {
  isOpen.value = false;
  localName.value = props.name ?? "";
  localEmail.value = props.email ?? "";
  localBirthDate.value = normalizeBirthDate(props.birth_date);
  localAvatar.value = props.avatar_url ?? "";
  avatarError.value = "";
  formErrors.value = {};
};

const triggerAvatarPick = () => {
  avatarInputRef.value?.click();
};

const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  avatarError.value = "";
  const maxSizeMb = 2;
  if (file.size > maxSizeMb * 1024 * 1024) {
    avatarError.value = `Max file size is ${maxSizeMb}MB.`;
    input.value = "";
    return;
  }

  isUploadingAvatar.value = true;
  try {
    const form = new FormData();
    form.append("avatar", file);
    const result = await $fetch<{ avatar_url: string }>("/api/me/avatar", {
      method: "POST",
      body: form,
    });
    localAvatar.value = result.avatar_url;
    emit("avatar-updated", result.avatar_url);
  } catch (error: any) {
    avatarError.value = error?.data?.message || error?.message || "Failed to upload avatar.";
  } finally {
    isUploadingAvatar.value = false;
    input.value = "";
  }
};
</script>

<template>
  <AppBaseModal v-model="isOpen" title="Edit profile" description="Update your basic information">
    <template #header="{ close }">
      <div class="relative z-10 flex items-start justify-between gap-4 border-b border-[#262C45] px-6 py-5">
        <div>
          <div class="mb-2 inline-flex items-center gap-2 rounded-full border border-[#262C45] bg-white/5 px-3 py-1 text-xs text-[#9AA3C7]">
            <span class="h-1.5 w-1.5 rounded-full bg-[#6C7CFF]"></span>
            Profile settings
          </div>

          <h2 class="text-lg font-semibold text-white">Edit profile</h2>
          <p class="mt-1 text-sm text-[#9AA3C7]">Update your basic information</p>
        </div>

        <button
          type="button"
          class="rounded-lg border border-[#262C45] bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 hover:border-[#6C7CFF]/40 transition"
          @click="handleClose">
          Close
        </button>
      </div>
    </template>

    <div class="mb-8 flex items-center gap-4">
      <div
        class="h-14 w-14 rounded-2xl border border-[#262C45] bg-[#6C7CFF]/25 flex items-center justify-center text-[#6C7CFF] font-semibold text-xl overflow-hidden">
        <img v-if="localAvatar" :src="localAvatar" alt="Avatar" class="h-full w-full object-cover" />
        <span v-else>{{ name.charAt(0) }}</span>
      </div>

      <div class="flex-1">
        <p class="text-sm text-white font-semibold">{{ name }}</p>
        <p class="text-xs text-[#9AA3C7]">{{ email }}</p>
      </div>

      <input ref="avatarInputRef" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleAvatarChange" />
      <button
        type="button"
        class="hidden md:inline-flex rounded-xl border border-[#262C45] bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 hover:border-[#6C7CFF]/40 transition disabled:opacity-60"
        :disabled="isUploadingAvatar"
        @click="triggerAvatarPick">
        {{ isUploadingAvatar ? "Uploading..." : "Change avatar" }}
      </button>
    </div>
    <p v-if="avatarError" class="-mt-6 mb-6 text-xs text-rose-300">{{ avatarError }}</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label class="text-sm text-[#9AA3C7]">Name</label>
        <input
          type="text"
          v-model="localName"
          :placeholder="name"
          class="mt-2 w-full rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition" />
        <p v-if="formErrors.name" class="mt-1 text-xs text-rose-300">{{ formErrors.name }}</p>
        <p v-else class="mt-2 text-xs text-[#9AA3C7]">Shown in the navbar and profile.</p>
      </div>

      <div>
        <label class="text-sm text-[#9AA3C7]">Email</label>
        <input
          type="email"
          v-model="localEmail"
          :placeholder="email"
          class="mt-2 w-full rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition" />

        <p v-if="formErrors.email" class="mt-1 text-xs text-rose-300">{{ formErrors.email }}</p>
        <p v-else class="mt-2 text-xs text-[#9AA3C7]">Email address used for notifications.</p>
      </div>
    </div>

    <div class="mt-5">
      <label class="text-sm text-[#9AA3C7]">Date of Birth</label>
      <AppDatePicker v-model="localBirthDate" :max="todayIso" placeholder="Select your birth date" />
    </div>

    <template #footer>
      <div class="relative z-10 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-end gap-3 border-t border-[#262C45] px-6 py-5">
        <button
          type="button"
          class="rounded-xl border border-[#262C45] bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10 hover:border-[#6C7CFF]/40 transition"
          @click="handleClose">
          Cancel
        </button>

        <button
          type="button"
          @click="saveChanges"
          class="rounded-xl px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#6C7CFF] to-[#8A95FF] hover:shadow-[0_0_24px_6px_rgba(108,124,255,0.35)] transition">
          Save changes
        </button>
      </div>
    </template>
  </AppBaseModal>
</template>
