import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface IframeWidgetProps {
  html: string
  data: Record<string, unknown>
  onOperation: (operationId: string) => void
}

/**
 * A single sandboxed iframe hosting the widget, bridging data/clicks via postMessage.
 * Deliberately omits `allow-same-origin` from `sandbox` so the widget's origin stays
 * opaque and can never reach `window.electronAPI`, regardless of the widget's own script.
 */
function Frame({ html, data, onOperation }: IframeWidgetProps) {
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

/**
 * Renders the widget at its slot size, with a button to expand it to a large,
 * full-screen view — templates author these widgets against their own real layout,
 * which a cramped sidebar box doesn't always do justice.
 */
export function IframeWidget(props: IframeWidgetProps) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expanded])

  return (
    <>
      <div className="relative w-full h-full">
        <button
          onClick={() => setExpanded(true)}
          title="Expand to full size"
          className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-md bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        <Frame {...props} />
      </div>

      {expanded && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false) }}
        >
          <div className="relative w-full max-w-3xl h-[85vh] bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setExpanded(false)}
              title="Close (Esc)"
              className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-md bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Frame {...props} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
