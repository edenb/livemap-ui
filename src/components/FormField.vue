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

<script>
import { ref, computed } from "vue";
export default {
  name: "FormField",
  props: {
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
  },
  emits: ["update:modelValue"],
  setup(props) {
    const showHidden = ref(false);
    const appendIcon = computed(() => {
      if (props.schema.hasHiddenControl) {
        return showHidden.value ? "mdi-eye" : "mdi-eye-off";
      } else {
        return "";
      }
    });
    return {
      value: props.modelValue,
      showHidden,
      appendIcon,
    };
  },
};
</script>
