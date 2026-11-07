export function safeAuthNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

export function withAuthNext(path: string, next: string | null) {
  if (!next) return path;

  const [basePath, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("next", next);
  return `${basePath}?${params.toString()}`;
}
