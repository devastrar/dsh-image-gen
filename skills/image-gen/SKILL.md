---
name: image-gen
description: Choose the right image provider, model, aspect ratio, and format for each image. The orchestrator decides; no manual reconfiguration required.
---

# Image Generation — Orchestrator Rules

You are the orchestrator. When a task needs an image, pass the settings for that specific call. Do not ask the user to reconfigure the UI.

## Selection rules

| Use case | Provider | Model | Why |
|----------|----------|-------|-----|
| Fast drafts / many variants | fal | `fal-ai/flux/schnell` | Cheapest and fastest |
| Normal app assets (icons, illustrations, backgrounds) | fal | `fal-ai/flux/dev` | Good quality, reasonable cost |
| Final / hero assets | fal | `fal-ai/flux-pro` | Highest quality |
| Readable text (logos, labels, buttons) | custom or fal | Ideogram (if configured) or Flux Dev | Best text rendering |
| Specific community model | replicate | Model ID from config | When a fine-tune is needed |
| Fallback on rate limit / error | (next in fallbackProviders) | Same use-case tier | Automatic |

## Per-call overrides

Any of these can be passed on a single `generate_image` call. They override the UI defaults for that call only.

| Argument | Values | Notes |
|----------|--------|-------|
| `provider` | fal, replicate, custom, gemini, seedream, local, codex, grok | Defaults to configured provider |
| `model` | Any model ID for that provider | e.g. `fal-ai/flux/dev`, `black-forest-labs/flux-schnell` |
| `use` | drafts, normal, final, text | Matches providers catalog if configured |
| `aspect_ratio` | 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3 | Overrides image_size |
| `image_size` | square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9 | Used if aspect_ratio is omitted |
| `output_format` | png, jpeg, webp | File type |
| `seed` | integer | Reproducible output |
| `steps` | 1–150 | Denoising steps |
| `sampler_name` | euler, dpmpp_2m, etc. | Sampling algorithm |
| `guidance_scale` | 1–20 | Prompt adherence |
| `quality` | auto, low, medium, high | Provider quality tier |
| `style_preset` | photorealistic, anime, cinematic, etc. | Aesthetic modifier |
| `negative_prompt` | string | What not to draw |
| `count` | 1–4 | Variations |
| `output_name` | string | File name stem |
| `output_dir` | string | Directory relative to workspace |

## Example

```
generate_image(
  prompt="minimal owl icon, flat vector, soft gray background",
  provider="fal",
  model="fal-ai/flux/dev",
  aspect_ratio="1:1",
  output_format="png",
  style_preset="minimalist_vector"
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
- Include the chosen provider, model, aspect ratio, and format in the task board note so the user can see what was used.
