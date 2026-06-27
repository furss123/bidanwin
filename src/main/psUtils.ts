// Shared PowerShell / process spawning utilities for the main process
import { spawn, spawnSync } from 'child_process'

export function getPowerShellCommand(): { exe: string; baseArgs: string[] } {
  const pwshCheck = spawnSync('where', ['pwsh'], { encoding: 'utf8', windowsHide: true })
  if (pwshCheck.status === 0 && pwshCheck.stdout.trim()) {
    return {
      exe: 'pwsh.exe',
      baseArgs: ['-NonInteractive', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command']
    }
  }
  return {
    exe: 'powershell.exe',
    baseArgs: ['-NonInteractive', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command']
  }
}

export type StreamHandler = (line: string, stream: 'stdout' | 'stderr') => void

/** Spawn a process and stream stdout/stderr line-by-line (uses spawn, not exec). */
export function spawnWithStreaming(
  exe: string,
  args: string[],
  onLine?: StreamHandler
): Promise<{ exitCode: number; output: string }> {
  return new Promise((resolve, reject) => {
    const lines: string[] = []
    const child = spawn(exe, args, { windowsHide: true })

    const handleChunk = (chunk: Buffer, stream: 'stdout' | 'stderr'): void => {
      const text = chunk.toString('utf8')
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed) continue
        lines.push(trimmed)
        onLine?.(trimmed, stream)
      }
    }

    child.stdout.on('data', (data: Buffer) => handleChunk(data, 'stdout'))
    child.stderr.on('data', (data: Buffer) => handleChunk(data, 'stderr'))
    child.on('error', reject)
    child.on('close', (code) => resolve({ exitCode: code ?? 1, output: lines.join('\n') }))
  })
}

/** Run a PowerShell script with streaming output. */
export async function runPowerShellScript(
  script: string,
  onLine?: StreamHandler
): Promise<{ exitCode: number; output: string }> {
  const { exe, baseArgs } = getPowerShellCommand()
  return spawnWithStreaming(exe, [...baseArgs, script], onLine)
}
