const snake = (value) =>
  value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()

const camel = (value) =>
  value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

export function toSnake(value) {
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(toSnake)
  if (!value || typeof value !== "object") return value
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key === "createdAt" ? "created_date" : key === "updatedAt" ? "updated_date" : snake(key),
      toSnake(item),
    ])
  )
}

export function toCamel(value) {
  if (Array.isArray(value)) return value.map(toCamel)
  if (!value || typeof value !== "object") return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [camel(key), toCamel(item)])
  )
}
