import { wait } from "@/utils";

async function retry(fnc: () => void, depth = 0, maxAttempts = 5) {
  try {
    return await fnc();
  } catch (e) {
    if (depth >= maxAttempts) {
      throw e;
    }
    const timeToWaitInMilliseconds = 2 ** depth * 1000 + Math.ceil(Math.random() * 1000);
    await wait(timeToWaitInMilliseconds);

    return retry(fnc, depth + 1, maxAttempts);
  }
}
