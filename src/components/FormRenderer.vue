<template>
  <v-row>
    <v-col
      v-for="(schema, index) in formSchema"
      :key="index"
      class="pb-0"
      :cols="schema.cols || 12"
      :sm="schema.colsSm"
      :md="schema.colsMd"
      :lg="schema.colsLg"
    >
      <component
        :is="schema.type"
        v-model="data[schema.state]"
        :schema="schema"
        @update:model-value="$emit('update:modelValue', data)"
      >
      </component>
    </v-col>
  </v-row>
</template>

<script>
import FormField from "@/components/FormField.vue";
import FormSelect from "@/components/FormSelect.vue";
export default {
  name: "FormRenderer",
  components: {
    FormField,
    FormSelect,
  },
  props: {
    modelValue: {
      type: Object,
      default: () => {},
      required: true,
    },
    formSchema: {
      type: Array,
      default: () => [],
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props) {
    return {
      data: props.modelValue,
    };
  },
};
</script>
