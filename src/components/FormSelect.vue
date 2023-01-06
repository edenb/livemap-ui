<template>
  <v-select
    v-model="value"
    density="comfortable"
    :counter="schema.hasCounter"
    :hint="schema.hint"
    :items="schema.items"
    :label="schema.label"
    :readonly="schema.isReadonly"
    :rules="schema.rules"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script>
import { computed } from "vue";
export default {
  name: "FormSelect",
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
    const value = computed(() => {
      if (props.modelValue == "") {
        return null;
      } else {
        return props.modelValue;
      }
    });
    return {
      value,
    };
  },
};
</script>
