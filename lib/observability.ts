type LogLevel = 'info' | 'warn' | 'error'

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value)
  } catch {
    return JSON.stringify({ message: 'Failed to serialize log payload' })
  }
}

function write(level: LogLevel, event: string, payload?: Record<string, unknown>) {
  const line = safeJson({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...(payload || {}),
  })

  if (level === 'error') {
    console.error(line)
    return
  }

  if (level === 'warn') {
    console.warn(line)
    return
  }

  console.log(line)
}

export function logInfo(event: string, payload?: Record<string, unknown>) {
  write('info', event, payload)
}

export function logWarn(event: string, payload?: Record<string, unknown>) {
  write('warn', event, payload)
}

export function logError(event: string, payload?: Record<string, unknown>) {
  write('error', event, payload)
}
