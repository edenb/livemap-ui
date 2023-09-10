export const rules = {
  between(min, max) {
    return (v) =>
      (v > min && v < max) || `Only numbers between ${min} and ${max} allowed`;
  },
  emptyOrEmail: (v) =>
    /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/.test(
      v,
    ) ||
    v.length == 0 ||
    "E-mail must be valid",
  min(minLength) {
    return (v) => v.length >= minLength || `At least ${minLength} characters`;
  },
  number: (v) => !Number.isNaN(v) || "Field should be a number",
  required: (v) => !!v || "Field is required",
  zeroOrMin(minLength) {
    return (v) =>
      v.length >= minLength ||
      v.length == 0 ||
      `Leave empty or at least ${minLength} characters`;
  },
};
