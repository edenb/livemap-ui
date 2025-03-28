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
        :is="schemaTypes[schema.type]"
        v-model="data[schema.state]"
        :schema="schema"
        @update:model-value="$emit('update:modelValue', data)"
      >
      </component>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from "vue";
import FormField from "@/components/FormField.vue";
import FormSelect from "@/components/FormSelect.vue";

const schemaTypes = { FormField, FormSelect };

const props = defineProps({
  modelValue: { type: Object, default: () => {} },
  formSchema: { type: Array, default: () => [] },
});
defineEmits(["update:modelValue"]);
const data = ref(props.modelValue);
</script>
