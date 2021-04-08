export async function shouldThrow(func: () => unknown | Promise<unknown>): Promise<void> {
  let result: unknown;
  try {
    result = await func();
  } catch (err) {
    return; // This is good, we wanted this.
  }
  const parsed = parseResult(result);
  throw new Error(`${func.name} should have thrown an error, but got ${parsed}`);
}

function parseResult(result: unknown): string {
  return JSON.stringify(result);
}
