/**
 * interactions — Module #5 interface surface.
 *
 * Callers mount `<ScenePicker>` inside the viewer's canvas. `resolveSelection` and `createHighlighter`
 * are exported because they are the module's tested seams; the R3F glue is smoke-tested.
 */
export { ScenePicker } from './ScenePicker'
export type { ScenePickerProps } from './ScenePicker'
export { resolveSelection } from './resolve-selection'
export { createHighlighter, type Highlighter, type Tint } from './highlight'
