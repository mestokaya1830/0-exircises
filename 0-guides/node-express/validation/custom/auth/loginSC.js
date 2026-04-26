import rules from "../rules.js";

export default {
  email: [
    rules.required("Email is required!"),
    rules.isEmail(),
  ],
  password: [
    rules.required(),
    rules.minLength(4),
  ],
};