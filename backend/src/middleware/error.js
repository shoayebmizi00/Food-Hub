export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
}

export function errorHandler(error, _req, res, _next) {
  console.error(error)
  const status =
    error.status ||
    (error.name === "ZodError" ? 400 : error.code === "P2025" ? 404 : error.code === "P2002" ? 409 : 500)
  const message =
    error.code === "P2002"
      ? "A record with this value already exists"
      : error.message || "Internal server error"

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { details: error.stack }),
  })
}
