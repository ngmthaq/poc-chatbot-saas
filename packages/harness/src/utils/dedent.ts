export function dedent(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += String(values[i]);
    }
  }
  if (result.startsWith('\n')) {
    result = result.slice(1);
  }
  const lines = result.split('\n');
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    let spaces = 0;
    for (const ch of line) {
      if (ch === ' ' || ch === '\t') {
        spaces++;
      } else {
        break;
      }
    }
    minIndent = Math.min(minIndent, spaces);
  }
  if (minIndent === Infinity) {
    minIndent = 0;
  }
  return lines
    .map((line) => line.slice(minIndent))
    .join('\n')
    .trimEnd();
}
