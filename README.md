## initx-plugin-svg-writer

Interactive SVG writer plugin for `initx`.

## Features

- `ix svg`: paste SVG content and save as icon file
- `ix svg config`: configure output directory and overwrite policy
- Store-based config persisted by initx plugin store

## Usage

Install plugin from current directory:

```bash
ix plugin add .
```

Configure output behavior:

```bash
ix svg config
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

## Development

```bash
pnpm install
pnpm stub
pnpm lint
pnpm tsc --noEmit
```

## Documentation

- [initx](https://github.com/initx-collective/initx)
