import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export function compressConfig(value: unknown) {
  return compressToEncodedURIComponent(JSON.stringify(value));
}

export function decompressConfig<T>(compressed: string): T {
  const json = decompressFromEncodedURIComponent(compressed);
  if (!json) {
    throw new Error("Could not decompress stored Lovely config.");
  }
  return JSON.parse(json) as T;
}
