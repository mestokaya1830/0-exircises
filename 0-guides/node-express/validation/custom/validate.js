const validate = (schema) => {
  return async (req, res, next) => {
    const errors = {};
    const validatedData = {};

    for (const field in schema) {
      const value = (req.body[field] ?? "").toString().trim();

      for (const rule of schema[field]) {
        const error = await rule(value, req); // async destek

        if (error) {
          errors[field] = error;
          break;
        }
      }

      validatedData[field] = value;
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    req.validated = validatedData;
    next();
  };
};

export default validate;