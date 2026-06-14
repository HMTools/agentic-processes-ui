import type { MarketplaceTemplate } from '../../types'

interface TemplateCardProps {
  template: MarketplaceTemplate
  onInstall: (template: MarketplaceTemplate) => void
  onUninstall: (template: MarketplaceTemplate) => void
  installing: boolean
  onClick: (template: MarketplaceTemplate) => void
}

export function TemplateCard({ template, onInstall, onUninstall, installing, onClick }: TemplateCardProps) {
  const templateKey = `${template.marketplace}/${template.category}/${template.name}`

  return (
    <div
      className="rounded-lg border border-border bg-surface hover:border-text-muted/30 transition-colors cursor-pointer flex flex-col"
      onClick={() => onClick(template)}
    >
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-sm font-medium text-text-primary truncate">
          {template.title || template.name}
        </h3>

        {/* Description */}
        {template.description && (
          <p className="text-xs text-text-muted mt-1 line-clamp-2 flex-1">
            {template.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="px-1.5 py-0.5 text-[11px] font-medium rounded bg-accent/10 text-accent border border-accent/20">
            {template.type}
          </span>
          <span className="px-1.5 py-0.5 text-[11px] rounded bg-surface-elevated text-text-muted border border-border">
            {template.category}
          </span>
          <span className="px-1.5 py-0.5 text-[11px] rounded bg-surface-elevated text-text-muted border border-border truncate max-w-[120px]" title={template.marketplace}>
            {template.marketplace}
          </span>
          {template.installed && (
            <span className="px-1.5 py-0.5 text-[11px] rounded bg-status-completed/10 text-status-completed border border-status-completed/20">
              installed
            </span>
          )}
          {template.updateAvailable && (
            <span className="px-1.5 py-0.5 text-[11px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              update
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border bg-surface-elevated/50 flex items-center justify-end gap-2">
        {template.installed ? (
          <>
            {template.updateAvailable && (
              <button
                onClick={(e) => { e.stopPropagation(); onInstall(template) }}
                disabled={installing}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  installing ? 'opacity-50 cursor-not-allowed' : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                {installing ? 'Updating...' : 'Update'}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onUninstall(template) }}
              disabled={installing}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                installing ? 'opacity-50 cursor-not-allowed' : 'text-status-failed hover:bg-status-failed/10'
              }`}
            >
              {installing && !template.updateAvailable ? 'Removing...' : 'Uninstall'}
            </button>
          </>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onInstall(template) }}
            disabled={installing}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              installing ? 'opacity-50 cursor-not-allowed' : 'text-white bg-accent hover:bg-accent/90'
            }`}
          >
            {installing ? 'Installing...' : 'Install'}
          </button>
        )}
      </div>
    </div>
  )
}
