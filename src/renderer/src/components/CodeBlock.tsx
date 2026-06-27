import { useState } from 'react'
import { useTranslation } from '../i18n'

interface CodeBlockProps {
  code: string
}

function CodeBlock({ code }: CodeBlockProps): React.JSX.Element {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="relative rounded-lg bg-stone-900 dark:bg-stone-950">
      <button
        type="button"
        onClick={handleCopy}
        className="transition-smooth absolute right-2 top-2 rounded px-2 py-1 text-xs font-medium text-accent hover:bg-stone-800"
      >
        {copied ? t.common.copied : t.common.copy}
      </button>
      <pre className="overflow-x-auto p-4 pr-16 font-mono text-xs leading-relaxed text-stone-200">
        {code}
      </pre>
    </div>
  )
}

export default CodeBlock
