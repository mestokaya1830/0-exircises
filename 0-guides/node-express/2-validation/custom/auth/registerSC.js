import rules from "../rules.js";

export default {
  username: [
    rules.required("Username is required!"),
    rules.minLength(3),
  ],
  email: [
    rules.required("Email is required!"),
    rules.isEmail(),
  ],
  password: [
    rules.required('Password is required!'),
    rules.minLength(6),
  ],
};