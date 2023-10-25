<template>
  <v-select
    v-model="value"
    density="comfortable"
    :counter="schema.hasCounter"
    :data-cy="schema.cyAttr"
    :hint="schema.hint"
    :items="schema.items"
    :label="schema.label"
    :readonly="schema.isReadonly"
    :rules="schema.rules"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
    required: true,
  },
  schema: {
    type: Object,
    default: () => ({}),
    required: true,
  },
});
defineEmits(["update:modelValue"]);
const value = ref(props.modelValue === "" ? null : props.modelValue);
</script>
