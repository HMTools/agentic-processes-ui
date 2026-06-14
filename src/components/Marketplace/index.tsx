import { useState, useCallback } from 'react'
import { TemplateCatalog } from './TemplateCatalog'
import { MarketplaceSources } from './MarketplaceSources'
import type { MarketplaceInfo, MarketplaceTemplate } from '../../types'

interface MarketplaceProps {
  onBack: () => void
  marketplaces: MarketplaceInfo[]
  catalog: MarketplaceTemplate[]
  catalogLoading: boolean
  onMarketplaceDataChanged: () => void
}

export function Marketplace({
  onBack,
  marketplaces,
  catalog,
  catalogLoading,
  onMarketplaceDataChanged
}: MarketplaceProps) {
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [installingTemplate, setInstallingTemplate] = useState<string | null>(null)

  const handleRefresh = useCallback(async (marketplaceName?: string) => {
    if (!window.electronAPI?.marketplaceRefresh) return
    setRefreshing(marketplaceName || '__all__')
    const result = await window.electronAPI.marketplaceRefresh(marketplaceName)
    if (result.success) {
      onMarketplaceDataChanged()
    }
    setRefreshing(null)
  }, [onMarketplaceDataChanged])

  const handleInstall = useCallback(async (template: MarketplaceTemplate) => {
    if (!window.electronAPI?.marketplaceInstall) return
    const key = `${template.marketplace}/${template.category}/${template.name}`
    setInstallingTemplate(key)
    const result = await window.electronAPI.marketplaceInstall(
      template.marketplace, template.name, template.category, template.type
    )
    if (result.success) {
      onMarketplaceDataChanged()
    }
    setInstallingTemplate(null)
  }, [onMarketplaceDataChanged])

  const handleUninstall = useCallback(async (template: MarketplaceTemplate) => {
    if (!window.electronAPI?.marketplaceUninstall) return
    const key = `${template.marketplace}/${template.category}/${template.name}`
    setInstallingTemplate(key)
    const result = await window.electronAPI.marketplaceUninstall(template.name, template.type)
    if (result.success) {
      onMarketplaceDataChanged()
    }
    setInstallingTemplate(null)
  }, [onMarketplaceDataChanged])

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-surface transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Marketplace</h1>
            <p className="text-xs text-text-muted">Browse and install templates</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Empty state: no marketplaces */}
          {marketplaces.length === 0 && !catalogLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 rounded-2xl bg-accent/10 mb-6">
                <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Welcome to the Marketplace</h2>
              <p className="text-sm text-text-muted max-w-md mb-6">
                Add your first marketplace source to start browsing and installing process templates and step definitions.
              </p>
              <p className="text-xs text-text-muted">
                Use the "Marketplace Sources" section below to add a git repository.
              </p>
            </div>
          ) : (
            /* Template Catalog */
            <TemplateCatalog
              catalog={catalog}
              marketplaces={marketplaces}
              loading={catalogLoading}
              installingTemplate={installingTemplate}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
            />
          )}

          {/* Marketplace Sources (collapsible admin section) */}
          <MarketplaceSources
            marketplaces={marketplaces}
            onMarketplacesChanged={onMarketplaceDataChanged}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </div>
  )
}
