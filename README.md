## initx-plugin-svg-writer

Interactive SVG writer plugin for `initx`.

## Features

- `ix svg`: paste SVG content and save as icon file
- `ix svg config`: configure output directory, icon root directories, and overwrite policy
- `ix svg dirs`: list pending temporary icons and target icon directories
- `ix svg clear`: clear SVG files in the temporary output directory
- Store-based config persisted by initx plugin store

## Usage

Install plugin:

```bash
ix plugin add svg-writer
```

If `ix` is not available globally, use:

```bash
pnpx initx plugin add svg-writer
```

Configure output behavior:

```bash
ix svg config
```

List icon directories for organization:

```bash
ix svg dirs
```

Clear temporary icons after organization:

```bash
ix svg clear
```

Run SVG writer:

```bash
ix svg
```

During input:

- Type `/` to open command palette
- `↑/↓` to navigate command list
- `Enter` to run selected command
- `Esc` to close command palette
- `/clear`: clear current SVG buffer
- `/done`: exit SVG input loop

Default output directory: `.auto-generate/icons-temporary`

Default icon root directories: `src/static` (configurable via `ix svg config`)

## Agent Skill

Install the `organize-icon` skill to let AI agents organize temporary icons into your project:

```bash
pnpx skills add imba97/initx-plugin-svg-writer
```

The skill guides agents to run `ix svg dirs`, move icons to target directories, and optionally `ix svg clear` after organization.

## Development

Install plugin from current directory for local development:

```bash
ix plugin add .
pnpm install
pnpm stub
pnpm lint
pnpm tsc --noEmit
```

## Documentation

- [initx](https://github.com/initx-collective/initx)
