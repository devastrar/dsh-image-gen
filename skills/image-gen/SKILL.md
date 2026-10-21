---
name: image-gen
description: Choose the right image provider and model for logos, icons, and app assets. The orchestrator decides; no manual reconfiguration required.
---

# Image Generation — Orchestrator Rules

You are the orchestrator. When a task needs an image, choose the provider and model based on the use case below. Do not ask the user to reconfigure settings.

## Selection rules

| Use case | Provider | Model | Why |
|----------|----------|-------|-----|
| Fast drafts / many variants | fal | `fal-ai/flux/schnell` | Cheapest and fastest |
| Normal app assets (icons, illustrations, backgrounds) | fal | `fal-ai/flux/dev` | Good quality, reasonable cost |
| Final / hero assets | fal | `fal-ai/flux-pro` | Highest quality |
| Readable text (logos, labels, buttons) | custom or fal | Ideogram (if configured) or Flux Dev | Best text rendering |
| Specific community model | replicate | Model ID from config | When a fine-tune is needed |
| Fallback on rate limit / error | (next in fallbackProviders) | Same use-case tier | Automatic |

## How to call

Pass explicit provider and model (or use) so the tool routes correctly:

```
generate_image(
  prompt="...",
  provider="fal",
  model="fal-ai/flux/dev"
)
```

Or by use case (matches the providers catalog):

```
generate_image(
  prompt="...",
  use="drafts"
)
```

## Fallback order

Configured in settings as `fallbackProviders`. Default recommendation:

1. fal (primary for most assets)
2. replicate (community models or backup)
3. custom (OpenAI-compatible or Ideogram gateway)

Do not switch providers manually. The tool cascade handles failures.

## Cost guidance

- Prefer Schnell for exploration and drafts.
- Use Dev for anything that will be reviewed by the user.
- Use Pro or Ideogram only when quality or text rendering requires it.
- Never default to the most expensive model.

## Output

- Save images into the project (e.g. `assets/` or `generated-images/`).
- Include the chosen provider and model in the task board note so the user can see what was used.
