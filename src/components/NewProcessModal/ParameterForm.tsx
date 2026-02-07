import { useCallback } from 'react'
import type { TemplateParameters, ParameterDefinition } from '../../types'

interface ParameterFormProps {
  parameters: TemplateParameters
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
  errors?: string[]
}

export function ParameterForm({ parameters, values, onChange, errors = [] }: ParameterFormProps) {
  const handleChange = useCallback((name: string, value: string) => {
    onChange({ ...values, [name]: value })
  }, [values, onChange])

  const hasOptional = parameters.optional.length > 0

  return (
    <div className="space-y-6">
      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="p-3 bg-status-failed/10 border border-status-failed/30 rounded-lg">
          <div className="flex items-center gap-2 text-status-failed text-xs font-medium mb-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Validation Errors
          </div>
          <ul className="space-y-0.5">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-status-failed">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Required parameters */}
      {parameters.required.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-3">
            Required Parameters
          </h4>
          <div className="space-y-4">
            {parameters.required.map(name => (
              <ParameterField
                key={name}
                name={name}
                definition={parameters.definitions[name]}
                value={values[name] || ''}
                onChange={handleChange}
                required
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional parameters */}
      {hasOptional && (
        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            Optional Parameters
          </h4>
          <div className="space-y-4">
            {parameters.optional.map(name => (
              <ParameterField
                key={name}
                name={name}
                definition={parameters.definitions[name]}
                value={values[name] || ''}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* No parameters message */}
      {parameters.required.length === 0 && parameters.optional.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-text-muted">This template has no parameters to configure.</p>
        </div>
      )}
    </div>
  )
}

interface ParameterFieldProps {
  name: string
  definition?: ParameterDefinition
  value: string
  onChange: (name: string, value: string) => void
  required?: boolean
}

function ParameterField({ name, definition, value, onChange, required }: ParameterFieldProps) {
  const hasEnum = definition?.enum && definition.enum.length > 0

  return (
    <div>
      <label className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-medium text-text-primary">{name}</span>
        {required && <span className="text-status-failed text-xs">*</span>}
        {definition?.type && (
          <span className="text-[10px] text-text-muted px-1 py-0.5 bg-surface rounded">
            {definition.type}
          </span>
        )}
      </label>

      {definition?.description && (
        <p className="text-[11px] text-text-muted mb-1.5">{definition.description}</p>
      )}

      {hasEnum ? (
        <select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">Select...</option>
          {definition!.enum!.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={definition?.example ? `e.g. ${definition.example}` : `Enter ${name}...`}
          className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      )}
    </div>
  )
}
