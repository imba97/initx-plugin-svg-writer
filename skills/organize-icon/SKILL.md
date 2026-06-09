---
name: organize-icon
description: 整理临时图标目录下的 SVG，按 ix svg dirs 输出的目标目录归类、重命名并输出结果表格；整理完成后可询问用户是否 ix svg clear 清空临时目录。用户提到整理 icon、归类图标、移动临时图标时使用。
disable-model-invocation: true
---

# 整理 icon

目标：将临时目录中的 SVG 图标，按业务语义迁移到项目内正确目录，并给出清晰结果。

## CLI 调用方式

执行本 skill 中的 initx 命令前，先确认本机是否可用短命令 `ix`（例如 `command -v ix`）。

- **已安装 initx**：直接使用 `ix`，如 `ix svg dirs`
- **未安装 initx**：使用 `pnpx initx` 或 `npx initx` 前缀，如 `pnpx initx svg dirs`

下文步骤中的 `ix svg ...` 均按上述规则替换前缀；不要假设用户一定已全局安装 initx。

## 执行步骤

1. 查询目录。  
   - 必须运行 `ix svg dirs`（或 `pnpx initx svg dirs` / `npx initx svg dirs`），不要依赖会受 `.gitignore`/忽略规则影响的搜索工具。  
   - 查看输出中的 `Temporary` 段落：若数量为 `(0)` 或显示 `(no pending icons)`，直接告知用户「没有待整理图标」，结束流程。  
   - 查看 `Targets` 段落：记录可用的目标目录树及已有图标文件名，作为归类与命名参考。

2. 识别图标归属目录（一次任务通常归属同一侧）。  
   - 目标路径以 `ix svg dirs` 的 `Targets` 实际输出为准，不要写死项目路径。  
   - 归类参考（目录名含以下语义时优先匹配）：  
     - 页面或用途出现 `pages/user/*`、`pages-user-*`、`user-side` -> 用户端目录  
     - 页面或用途出现 `pages/coach/*`、`pages-coach-*`、`coach-side` -> 教练端目录  
     - 跨端公用能力（tabbar、基础动作、通用箭头等）-> common 目录  
   - 如果用户意图不明确，必须先询问用户目标目录或具体使用场景，再执行移动。

3. 移动时同步重命名。  
   - 若原文件名是中文，或英文命名不清晰，改为语义明确的英文小写 kebab-case，例如：  
     - `扫描.svg` -> `scan.svg`
   - 命名应表达用途，不要过度缩写。

4. 处理同名冲突。  
   - 若目标路径已存在同名文件，先询问用户：覆盖、改名、或跳过。  
   - 未获得用户确认前，不执行覆盖。

5. 输出本次结果表格。  
   - 表头建议：`原文件名 | 新路径`  
   - 每一行展示一次迁移结果，例如：  
     - `扫描.svg | src/static/user-side/icons/common/scan.svg`

6. 清空临时目录。  
   - 整理完成后，**必须询问**用户是否需要清空临时目录。  
   - 若用户确认，运行 `ix svg clear`（或 `pnpx initx svg clear` / `npx initx svg clear`）删除临时目录下的 SVG 文件。  
   - 注意：`ix svg clear`（CLI 清空临时目录）与交互式 `ix svg` 中的 `/clear`（清空当前 SVG 输入缓冲）语义不同，不要混淆。

## 注意事项

- 迁移前确认目标目录存在；不存在时先创建对应目录。
- 只处理本次任务相关图标，避免混入无关历史文件。
- 输出路径使用仓库内相对路径，便于用户直接检索与复核。
- 若用户提供了图标绝对路径，先用 `test -f <path>` 或 `ls <path>` 直接核验，再执行后续归类。
- `ix svg clear` 只清空 store 配置的临时输出目录，不会删除 `Targets` 下的正式图标。
- 若 `Targets` 为空或不符合预期，提示用户运行 `ix svg config`（或 `pnpx initx svg config` / `npx initx svg config`）配置 `iconRoots`（逗号分隔，默认 `src/static`）。
