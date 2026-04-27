const handleError = (res, error) => {
  let message = "Server error";

  console.error("Error:", error);

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const firstError = Object.values(error.errors)[0];
    message = firstError.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Duplicate key error (MongoDB)
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
    });
  }

  // Custom error message
  if (error.message) {
    message = error.message;
  }

  return res.status(500).json({
    success: false,
    message,
  });
};

module.exports = { handleError };