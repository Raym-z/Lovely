function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function replaceNameDeep<T>(
  value: T,
  oldName: string,
  newName: string,
): T {
  if (!oldName || oldName === newName) return value;

  if (typeof value === "string") {
    const pattern = new RegExp(`\\b${escapeRegExp(oldName)}\\b`, "g");
    return value.replace(pattern, newName) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      replaceNameDeep(item, oldName, newName),
    ) as T;
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      result[key] = replaceNameDeep(nested, oldName, newName);
    }
    return result as T;
  }

  return value;
}
