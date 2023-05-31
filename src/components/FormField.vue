<template>
  <v-text-field
    v-model="value"
    density="comfortable"
    :append-inner-icon="appendIcon"
    :counter="schema.hasCounter"
    :hint="schema.hint"
    :label="schema.label"
    :readonly="schema.isReadonly"
    :rules="schema.rules"
    :type="schema.isPassword && !showHidden ? 'password' : 'text'"
    @update:model-value="$emit('update:modelValue', $event)"
    @click:append-inner="showHidden = !showHidden"
  />
</template>

<script setup>
import { computed, ref } from "vue";

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
const value = ref(props.modelValue);
const showHidden = ref(false);
const appendIcon = computed(() => {
  if (props.schema.hasHiddenControl) {
    return showHidden.value ? "mdi-eye" : "mdi-eye-off";
  } else {
    return "";
  }
});
</script>
