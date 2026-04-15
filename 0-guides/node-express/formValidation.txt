const formValidation = (args) => {
  let errors = {};
  Object.keys(args).forEach((key) => {
    const value = args[key] ? String(args[key]).trim() : "";
    if (!value) {
      errors[key] = `${key} cannot be empty!`;
      return;
    }

    if (key === 'username' && value.length < 3) {
      errors[key] = `${key} must be at least 3 characters!`;
      return;
    }

    if (key === 'email') {
      if (value.length < 10) {
        errors[key] = `${key} must be at least 10 characters!`;
        return;
      }
      const emailRegex = /([^ ]+)@([^ ]+)\.([a-z]{2,3})(\.[a-z]{2,3})?$/;
      if (!value.match(emailRegex)) {
        errors[key] = `${key}Email format is invalid!`;
        return;
      }
    }

    if (key === 'password' && value.length < 4) {
      errors[key] = `${key} must be at least 4 characters!`;
      return;
    }
  });

  return errors;
};

export default formValidation;





const errors = formValidation({ username, email, password });
if (Object.keys(errors).length > 0) {
   return next(new ErrorHandler(400, Object.values(errors)));
}
