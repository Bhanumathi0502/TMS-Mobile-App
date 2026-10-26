function errorHandler(err, req, res, next) {
  console.log("❌ ERROR:", err);

  let status = err.status || 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  if (err.code === 11000) {
    status = 400;
    const fields = Object.keys(err.keyValue || {});
    message = `Already exists: ${fields.map((f) => `${f}=${err.keyValue[f]}`).join(", ")}`;
  }

  if (err.name === "CastError") {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }

  res.status(status).json({ message });
}

module.exports = { errorHandler };