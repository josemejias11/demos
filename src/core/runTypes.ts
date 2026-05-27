export async function runWithContext<T>(context: any, callback: () => Promise<T>): Promise<T> {
  return callback();
}
