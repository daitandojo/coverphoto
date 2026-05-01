const PREFIX = "[CoverPhoto]";

const LOG_LEVEL = process.env.NODE_ENV === "production" ? 1 : 0;

export function log(...args: any[]) {
  if (LOG_LEVEL > 0) return;
  console.log(PREFIX, ...args);
}

export function warn(...args: any[]) {
  console.warn(PREFIX, "[WARN]", ...args);
}

export function error(...args: any[]) {
  console.error(PREFIX, "[ERROR]", ...args);
}

export function apiLog(step: string, ...args: any[]) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`${PREFIX} [${ts}] ${step}`, ...args);
}
