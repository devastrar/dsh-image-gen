// lib/multi-provider.js — Multi-provider catalog and model selection for orchestrator.
// Lets you configure multiple providers, multiple models per provider, and
// an explicit fallback order. The orchestrator skill selects by use case.

import { PROVIDER_KEYS } from './provider-utils.js'

/**
 * Resolve the effective provider and model for a generation call.
 * Priority: explicit tool args > use-case match in catalog > primary config.
 *
 * @param {object} cfg Live config (may include providers catalog)
 * @param {object} args Tool arguments (optional provider, model, use)
 * @returns {{ provider: string, model: string, keyEnv?: string }}
 */
export function resolveProviderAndModel(cfg, args = {}) {
  const catalog = Array.isArray(cfg.providers) ? cfg.providers : []
  const requestedProvider = (args.provider || '').trim().toLowerCase()
  const requestedModel = (args.model || '').trim()
  const requestedUse = (args.use || '').trim().toLowerCase()

  // 1. Explicit provider + model from orchestrator
  if (requestedProvider && PROVIDER_KEYS.includes(requestedProvider)) {
    const entry = catalog.find((p) => p && p.id === requestedProvider)
    const model = requestedModel || pickModelFromEntry(entry, requestedUse) || defaultModelFor(cfg, requestedProvider)
    return {
      provider: requestedProvider,
      model,
      keyEnv: entry?.keyEnv || keyEnvFor(cfg, requestedProvider),
    }
  }

  // 2. Use-case match across catalog (e.g. use: "drafts" → schnell)
  if (requestedUse && catalog.length) {
    for (const entry of catalog) {
      const model = pickModelFromEntry(entry, requestedUse)
      if (model) {
        return {
          provider: entry.id,
          model,
          keyEnv: entry.keyEnv || keyEnvFor(cfg, entry.id),
        }
      }
    }
  }

  // 3. Primary config fallback
  const primary = cfg.provider || 'fal'
  return {
    provider: primary,
    model: requestedModel || defaultModelFor(cfg, primary),
    keyEnv: keyEnvFor(cfg, primary),
  }
}

function pickModelFromEntry(entry, use) {
  if (!entry || !Array.isArray(entry.models)) return null
  if (use) {
    const match = entry.models.find((m) => m && String(m.use || '').toLowerCase() === use)
    if (match?.id) return match.id
  }
  return entry.models[0]?.id || null
}

function defaultModelFor(cfg, provider) {
  switch (provider) {
    case 'fal': return cfg.model || 'fal-ai/flux/dev'
    case 'replicate': return cfg.replicateModel || 'black-forest-labs/flux-schnell'
    case 'custom': return cfg.customModel || 'dall-e-3'
    case 'gemini': return cfg.geminiModel || 'gemini-3.1-flash-image'
    case 'seedream': return cfg.seedreamModel || 'doubao-seedream-3.0-t2i'
    case 'local': return cfg.localModel || 'v1-5-pruned-emaonly.safetensors'
    default: return cfg.model || 'default'
  }
}

function keyEnvFor(cfg, provider) {
  switch (provider) {
    case 'fal': return cfg.apiKeyEnv || 'FAL_API_KEY'
    case 'replicate': return cfg.replicateKeyEnv || 'REPLICATE_API_TOKEN'
    case 'custom': return cfg.customKeyEnv || 'CUSTOM_IMAGE_API_KEY'
    case 'gemini': return cfg.geminiKeyEnv || 'GEMINI_API_KEY'
    case 'seedream': return cfg.seedreamKeyEnv || 'SEEDREAM_API_KEY'
    case 'grok': return cfg.grokKeyEnv || 'XAI_API_KEY'
    case 'codex': return cfg.chatgptKeyEnv || 'OPENAI_API_KEY'
    default: return cfg.apiKeyEnv
  }
}

/**
 * Build the ordered fallback chain.
 * Primary first, then configured fallbackProviders, then remaining known providers.
 */
export function buildFallbackOrder(cfg, primary) {
  const chain = [primary]
  const configured = Array.isArray(cfg.fallbackProviders) ? cfg.fallbackProviders : []
  for (const p of configured) {
    const id = String(p || '').trim().toLowerCase()
    if (id && !chain.includes(id)) chain.push(id)
  }
  for (const p of PROVIDER_KEYS) {
    if (!chain.includes(p)) chain.push(p)
  }
  return chain
}
