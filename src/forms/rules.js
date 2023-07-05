export const rules = {
  emptyOrEmail: (v) =>
    /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/.test(
      v
    ) ||
    v.length == 0 ||
    "E-mail must be valid",
  min(minLength) {
    return (v) => v.length >= minLength || `At least ${minLength} characters`;
  },
  required: (v) => !!v || "Field is required",
  zeroOrMin(minLength) {
    return (v) =>
      v.length >= minLength ||
      v.length == 0 ||
      `Leave empty or at least ${minLength} characters`;
  },
};
