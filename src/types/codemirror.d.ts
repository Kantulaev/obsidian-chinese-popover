// Local type definitions for CodeMirror
export declare class EditorView {
  dom: HTMLElement;
  state: any;
  dispatch(...args: any[]): void;
  posAtCoords(coords: { x: number; y: number }): number | null;
  coordsAtPos(pos: number): { left: number; right: number; top: number; bottom: number } | null;
  static mouseSelectionStyle: {
    of(extension: (view: EditorView, event: MouseEvent) => any): any;
  };
  static domEventHandlers(handlers: Record<string, (event: any, view: EditorView) => boolean | void>): any;
  static theme(spec: any, options?: any): any;
  static baseTheme(spec: any): any;
  static updateListener: any;
  static lineWrapping: any;
}

export type ViewPlugin<T = any, V = any> = any;
export type PluginValue = any;

export type Extension = any;
export type StateField<T = any> = any;

export declare class EditorSelection {
  static single(anchor: number, head?: number): any;
  static range(anchor: number, head?: number): any;
  static create(ranges: readonly any[], mainIndex?: number): any;
}
