const rules = {
  required: (msg = "cannot be null") => (val) =>
    !val ? msg : null,

  minLength: (min, msg) => (val) =>
    val.length >= min ? null : msg || `min ${min} chars`,

  isEmail: (msg = "invalid email") => (val) =>
    /\S+@\S+\.\S+/.test(val) ? null : msg,

  phone: (msg = "invalid phone") => (val) =>
    /^\+?[0-9\s\-()]{7,20}$/.test(val) ? null : msg,

  url: (msg = "invalid url") => (val) =>
    /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(val)
      ? null
      : msg
};

export default rules;