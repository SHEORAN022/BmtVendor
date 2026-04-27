module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: true, // show all errors
    stripUnknown: true // remove unwanted fields
  });

  if (error) {
    return res.status(400).json({
      success: false,
    message: error.details[0].message.replace(/"/g, '')
    });
  }

  next();
};