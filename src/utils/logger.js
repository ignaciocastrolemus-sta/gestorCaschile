const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;

function safeLog(level, message, meta) {
  if (!isDev) return;
  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console[level](message, meta);
    return;
  }
  // eslint-disable-next-line no-console
  console[level](message);
}

export function logWarn(message, meta) {
  safeLog("warn", message, meta);
}

export function logInfo(message, meta) {
  safeLog("info", message, meta);
}

export function logError(message, meta) {
  safeLog("error", message, meta);
}
