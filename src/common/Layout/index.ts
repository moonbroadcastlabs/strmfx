import { InitializedSource, Source, Sources, SourceTypes } from "./Source";
export { InitializedSource, Source, Sources, SourceTypes };

export interface Layout {
  dimensions: {
    width: number;
    height: number;
  };
  sources: Source<any>[];
}

export interface SourceRenderCallback<Type extends keyof Sources> {
  (context: CanvasRenderingContext2D, source: InitializedSource<Type>): void;
}

export interface SourceInitializeCallback<Type extends keyof Sources> {
  (source: Source<Type>): void;
}

interface SourceRenderer {
  (context: CanvasRenderingContext2D, source: Source<any>): void;
}

export type SourceRenderers<S = Sources> = { [t in keyof S]: SourceRenderer }

export function validateSource<Type extends keyof Sources>(
  source: Source<any>,
  type: Type
): source is Source<Type> {
  return source.type === type;
}

export function validateSourceIsInitialized<Type extends keyof Sources>(
  source: Source<Type>
): source is InitializedSource<Type> {
  return source.hasOwnProperty("source");
}