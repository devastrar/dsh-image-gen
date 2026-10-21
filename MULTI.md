# Multi-provider changes (devastrar fork)

This fork of [@goodandready/dsh-image-gen](https://github.com/GooDAnDReaDY/dsh-image-gen) adds:

1. **Providers catalog** — configure multiple providers and multiple models per provider (`config.providers`).
2. **Fallback order** — `fallbackProviders` array (already in upstream; documented here).
3. **Resolver** — `lib/multi-provider.js` selects provider/model from tool args or use-case tags.
4. **Orchestrator skill** — `skills/image-gen/SKILL.md`.

## Install

```bash
dsh plugin --profile web add github:devastrar/dsh-image-gen
```

Or from the host:

```bash
CONTAINER=$(podman ps --format '{{.Names}}' | grep deepseek-harness | head -1)
podman exec "$CONTAINER" dsh plugin --profile web add github:devastrar/dsh-image-gen
```

## Configure

Merge `config/providers.example.yml` into `~/.dsh/profiles/web/cordis.patch.yml`.

Set keys:

```bash
export FAL_API_KEY="..."
export REPLICATE_API_TOKEN="r8_..."
```

## Skill

Copy `skills/image-gen/SKILL.md` into a project:

```
<project>/.dsh/skills/image-gen/SKILL.md
```

The orchestrator then chooses drafts/normal/final/text without you reconfiguring.

## Tool args

The resolver supports:

- `provider` — fal, replicate, custom, etc.
- `model` — specific model id
- `use` — drafts, normal, final, text (matches catalog)

Wiring these into `generate_image` parameters is the remaining step so the agent can pass them directly. Until then, the skill + configured primary + fallback chain cover most cases.
