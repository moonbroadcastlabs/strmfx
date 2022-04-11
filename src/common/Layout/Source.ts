import { ImageSourceObject, ImageSourcePayload } from "./Image";
import { VideoDeviceCaptureSourceObject, VideoDeviceCaptureSourcePayload } from "./VideoDeviceCapture";

export enum SourceTypes {
  VideoDeviceCapture = "VideoDeviceCapture",
  Image = "Image",
}

export interface SourceContstraints {
  x: number;
  y: number;
  height?: number;
  width?: number;
}

export interface Source<Type extends keyof Sources> {
  type: Type;
  payload: Sources[Type]["payload"];
  constraints: SourceContstraints;
}

export interface InitializedSource<Type extends keyof Sources>
  extends Source<Type> {
  source: Sources[Type]["source"];
}

export interface SourceTypeDescription<Type extends keyof Sources> {
  payload: SourcePayloads[Type];
  source: SourceObjects[Type];
}

export type SourcePayloads = {
  [SourceTypes.VideoDeviceCapture]: VideoDeviceCaptureSourcePayload;
  [SourceTypes.Image]: ImageSourcePayload;
};

export type SourceObjects = {
  [SourceTypes.VideoDeviceCapture]: VideoDeviceCaptureSourceObject;
  [SourceTypes.Image]: ImageSourceObject;
};

export type Sources = {
  [SourceTypes.VideoDeviceCapture]: SourceTypeDescription<SourceTypes.VideoDeviceCapture>;
  [SourceTypes.Image]: SourceTypeDescription<SourceTypes.Image>;
};