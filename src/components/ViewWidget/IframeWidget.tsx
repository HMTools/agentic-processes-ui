import { useEffect, useRef } from 'react'

interface IframeWidgetProps {
  html: string
  data: Record<string, unknown>
  onOperation: (operationId: string) => void
}

/**
 * Hosts a template-authored view widget in a sandboxed iframe and bridges data/clicks via
 * postMessage. Deliberately omits `allow-same-origin` from `sandbox` so the widget's origin
 * stays opaque and can never reach `window.electronAPI`, regardless of the widget's own script.
 */
export function IframeWidget({ html, data, onOperation }: IframeWidgetProps) {
  const ref = useRef<HTMLIFrameElement>(null)

  const handleLoad = () => {
    ref.current?.contentWindow?.postMessage({ type: 'view-data', data }, '*')
  }

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return
      if (e.data?.type === 'operation' && typeof e.data.operationId === 'string') {
        onOperation(e.data.operationId)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onOperation])

  return (
    <iframe
      ref={ref}
      sandbox="allow-scripts"
      srcDoc={html}
      onLoad={handleLoad}
      className="w-full h-full border-0 rounded-lg"
      title="Step view"
    />
  )
}
