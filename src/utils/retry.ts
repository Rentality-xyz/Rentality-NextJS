import { sleep } from "./sleep";

export async function retry(fnc: () => void, depth = 0, maxAttempts = 5): Promise<void> {
  try {
    return await fnc();
  } catch (error) {
    if (depth >= maxAttempts) {
      throw error;
    }
    const timeToWaitInMilliseconds = 2 ** depth * 1000 + Math.ceil(Math.random() * 1000);
    await sleep(timeToWaitInMilliseconds);

    return await retry(fnc, depth + 1, maxAttempts);
  }
}
