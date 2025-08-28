export default function replacePlaceholders(
  template: string,
  values: Record<string, string | number | boolean> = {},
): string {
  return Object.entries(values).reduce((result, [key, val]) => {
    const placeholder = `{${key}}`;
    return result.replaceAll(placeholder, String(val));
  }, template);
}
