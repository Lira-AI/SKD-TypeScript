export function isEmptyObject(obj: unknown): boolean {
  // Check if obj is an object and not null
  if (typeof obj === 'object' && obj !== null) {
    // Check if the object has no own properties
    return Object.keys(obj).length === 0
  }
  return false
}
