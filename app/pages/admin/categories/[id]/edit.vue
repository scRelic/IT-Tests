<script setup lang="ts">
import { ref } from "vue";
import { object, string, array } from "yup";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const categorySchema = object({
  title: string().trim().required().min(2).max(44),
  description: string().trim().required().max(180),
  technologies: array().of(string().trim().min(1)).notRequired().nullable(),
});

type CategoryRow = {
  id: number;
  title: string;
  description: string;
  technologies?: string[] | null;
  status?: "active" | "hidden";
};

type CategoryResponse = {
  category: CategoryRow;
};

const router = useRouter();
const route = useRoute();
const { push } = useToast();

const title = ref("");
const description = ref("");
const status = ref<"active" | "hidden">("active");
const technologies = ref<string[]>([]);
const technologyInput = ref("");

const isLoading = ref(false);

const formErrors = ref<Record<string, string>>({});

const addTechnology = () => {
  const t = technologyInput.value.trim();
  if (!t) return;
  if (!technologies.value.includes(t)) technologies.value.push(t);
  technologyInput.value = "";
};

const removeTechnology = (t: string) => {
  technologies.value = technologies.value.filter((x) => x !== t);
};

const {
  data: category,
  pending,
  error,
} = await useFetch<CategoryResponse>(() => `/api/admin/categories/${route.params.id}`, {
  key: () => `admin-category-${route.params.id}`,
});

const updateCategory = async () => {
  if (isLoading.value) return;

  const isValid = await validate();
  if (!isValid) return;

  isLoading.value = true;

  try {
    await $fetch(`/api/admin/categories/${route.params.id}`, {
      method: "PUT",
      body: {
        title: title.value,
        description: description.value,
        status: status.value,
        technologies: technologies.value,
      },
    });

    title.value = "";
    description.value = "";
    status.value = "active";
    technologies.value = [];
    technologyInput.value = "";

    router.push("/admin/categories");
    push({ title: "Success", description: "Category updated successfully", variant: "success", duration: 4000 });
  } catch (error) {
    console.error("Failed to update category:", error);
  } finally {
    isLoading.value = false;
  }
};

const validate = async () => {
  try {
    await categorySchema.validate(
      {
        title: title.value,
        description: description.value,
        technologies: technologies.value,
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

watchEffect(() => {
  const c = category.value?.category;
  if (!c) return;

  title.value = c.title ?? "";
  description.value = c.description ?? "";
  if (c.status) status.value = c.status;
  technologies.value = c.technologies ?? [];
});
</script>

<template>
  <div class="px-6 my-6">
    <div class="mb-4">
      <div>
        <h1 class="text-2xl font-semibold mt-1">Edit category</h1>
        <p class="text-sm text-[#9AA3C7] mt-2 max-w-xl">Edit an existing category to organize tests. Modify tags for better filtering.</p>
      </div>
    </div>

    <p v-if="error" class="text-center text-red-500 mt-10">Error loading category details.</p>
    <p v-else-if="pending" class="text-center text-gray-500 mt-10">Loading category details...</p>
    <section v-else>
      <div class="rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] overflow-hidden">
        <div class="p-5 border-b border-[#262C45] flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold">Category details</p>
            <p class="text-xs text-[#9AA3C7] mt-1">Title, slug, description, tags and visibility.</p>
          </div>
        </div>

        <div class="p-5 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-[#9AA3C7]">Title</label>
              <input
                v-model="title"
                placeholder="Frontend"
                class="mt-2 h-11 w-full rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition" />
              <p v-if="formErrors.title" class="mt-1 text-xs text-rose-300">{{ formErrors.title }}</p>
              <p v-else class="mt-2 text-xs text-[#9AA3C7]">Shown to users on the website.</p>
            </div>
          </div>

          <div>
            <label class="text-sm text-[#9AA3C7]">Description</label>
            <textarea
              v-model="description"
              rows="4"
              placeholder="UI, browser, frameworks and tooling."
              class="mt-2 w-full rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/20 resize-none focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition" />
            <div class="mt-2 flex items-center justify-between text-xs text-[#9AA3C7]">
              <div>
                <p v-if="formErrors.description" class="mt-1 text-xs text-rose-300">{{ formErrors.description }}</p>
                <span v-else>Short and searchable description.</span>
              </div>
              <span>{{ description?.length ?? 0 }}/180</span>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-[#9AA3C7]">Visibility</label>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="status = 'active'"
                  :class="
                    status === 'active'
                      ? 'border-[#6C7CFF] bg-[#6C7CFF]/15 text-white'
                      : 'border-[#262C45] bg-white/5 text-[#9AA3C7] hover:bg-white/10 hover:text-white hover:border-[#6C7CFF]/40'
                  "
                  class="h-11 rounded-xl border px-3 text-sm transition">
                  Active
                </button>
                <button
                  type="button"
                  @click="status = 'hidden'"
                  :class="
                    status === 'hidden'
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                      : 'border-[#262C45] bg-white/5 text-[#9AA3C7] hover:bg-white/10 hover:text-white hover:border-[#6C7CFF]/40'
                  "
                  class="h-11 rounded-xl border px-3 text-sm transition">
                  Hidden
                </button>
              </div>
              <p class="mt-2 text-xs text-[#9AA3C7]">Hidden categories are not visible to users.</p>
            </div>
          </div>

          <div>
            <label class="text-sm text-[#9AA3C7]">Technologies</label>

            <div class="mt-2 flex flex-col md:flex-row md:items-center gap-2">
              <input
                v-model="technologyInput"
                @keydown.enter.prevent="addTechnology"
                placeholder="Add technology (Enter)…"
                class="h-11 flex-1 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition" />
              <button type="button" @click="addTechnology" class="h-11 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm hover:bg-white/10 transition">
                Add
              </button>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="t in technologies"
                :key="t"
                type="button"
                @click="removeTechnology(t)"
                class="group inline-flex items-center gap-2 rounded-full border border-[#262C45] bg-white/5 px-3 py-1 text-xs text-[#9AA3C7] hover:bg-white/10 hover:text-white transition"
                title="Remove technology">
                <span>{{ t }}</span>
                <span class="opacity-60 group-hover:opacity-100">✕</span>
              </button>
              <span v-if="technologies.length === 0" class="text-xs text-[#9AA3C7]">No technologies yet.</span>
            </div>
            <p v-if="formErrors.technology" class="mt-1 text-xs text-rose-300">{{ formErrors.technology }}</p>
            <p v-else class="mt-2 text-xs text-[#9AA3C7]">Click technology to remove. Technologies help search and filtering.</p>
          </div>
        </div>

        <div class="p-5 border-t border-[#262C45] flex flex-col sm:flex-row gap-2 justify-end">
          <button @click="router.back" class="h-11 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm hover:bg-white/10 transition">Cancel</button>
          <button @click="updateCategory" :disabled="isLoading" class="h-11 rounded-xl px-4 text-sm font-semibold bg-[#6C7CFF] hover:opacity-90 transition">
            Edit
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
