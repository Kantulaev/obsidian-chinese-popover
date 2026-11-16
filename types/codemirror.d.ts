/* eslint-disable */
// Local type definitions for CodeMirror

export interface TextLine {
  from: number;
  to: number;
  text: string;
  number: number;
}

export interface SelectionRange {
  from: number;
  to: number;
  head: number;
  empty: boolean;
}

export interface EditorState {
  doc: {
    lineAt(pos: number): TextLine;
    sliceString(from: number, to: number): string;
  };
  selection: {
    main: SelectionRange;
    addRange(range: unknown): unknown;
  };
  sliceDoc(from?: number, to?: number): string;
}

export declare class EditorView {
  dom: HTMLElement;
  state: EditorState;
  dispatch(...args: unknown[]): void;
  posAtCoords(coords: { x: number; y: number }): number | null;
  coordsAtPos(pos: number): { left: number; right: number; top: number; bottom: number } | null;
  static mouseSelectionStyle: {
    of(extension: (view: EditorView, event: MouseEvent) => unknown): unknown;
  };
  static domEventHandlers(handlers: Record<string, (event: MouseEvent, view: EditorView) => boolean | void>): unknown;
  static theme(spec: unknown, options?: unknown): unknown;
  static baseTheme(spec: unknown): unknown;
  static updateListener: unknown;
  static lineWrapping: unknown;
}

export type ViewPlugin<T = unknown, V = unknown> = { plugin: T; value: V };
export type PluginValue = unknown;

export type Extension = unknown;
export type StateField<T = unknown> = { field: T };

export declare class EditorSelection {
  static single(anchor: number, head?: number): unknown;
  static range(anchor: number, head?: number): unknown;
  static create(ranges: readonly unknown[], mainIndex?: number): unknown;
}
