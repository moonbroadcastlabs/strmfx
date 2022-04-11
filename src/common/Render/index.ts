import {
  Layout,
  Source,
  SourceInitializeCallback,
  SourceRenderCallback,
  SourceRenderers,
  Sources,
  SourceTypes,
  validateSource,
  validateSourceIsInitialized,
} from "../Layout";

function SourceRenderer<Type extends keyof Sources>(
  type: Type,
  setup: SourceInitializeCallback<Type>,
  render: SourceRenderCallback<Type>
) {
  return function (context: CanvasRenderingContext2D, source: Source<any>) {
    if (validateSource(source, type)) {
      if (!validateSourceIsInitialized(source)) {
        setup(source);
      }
      if (validateSourceIsInitialized(source)) {
        render(context, source);
      }
    }
  };
}

function createVideoElement() {
  return ((video: HTMLVideoElement) => {
    video.autoplay = true;
    return video;
  })(document.createElement("video"));
}

const sourceRenderers: SourceRenderers = {
  [SourceTypes.VideoDeviceCapture]: SourceRenderer(
    SourceTypes.VideoDeviceCapture,
    (source) => {
      const video = createVideoElement();
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
      });
      Object.assign(source, { source: { video } });
    },
    (context, source) => {
      context.drawImage(
        source.source.video,
        source.constraints.x,
        source.constraints.y
      );
    }
  ),
  [SourceTypes.Image]: SourceRenderer(
    SourceTypes.Image,
    (source) => {
      const image = document.createElement("img");
      image.src = source.payload.image;
      Object.assign(source, { source: { image } });
    },
    (context, source) => {
      context.drawImage(
        source.source.image,
        source.constraints.x,
        source.constraints.y
      );
    }
  ),
};

export function drawSource(context: CanvasRenderingContext2D) {
  return function <Type extends keyof Sources>(source: Source<Type>) {
    sourceRenderers[source.type](context, source);
  };
}

function contextOperation(
  canvas: HTMLCanvasElement,
  cb: (contex: CanvasRenderingContext2D) => void
) {
  const context = canvas.getContext("2d");
  return () => {
    if (context) {
      cb(context);
    }
  };
}

function canvasContextRenderLoop(canvas: HTMLCanvasElement, layout: Layout) {
  const clear = contextOperation(canvas, (context) => {
    context.fillStyle = "gray";
    context.fillRect(0, 0, canvas.width, canvas.height);
  });

  const render = contextOperation(canvas, (context) => {
    layout.sources.forEach(drawSource(context));
  });

  requestAnimationFrame(function loop() {
    clear();
    render();
    requestAnimationFrame(loop);
  });
}

export function createCanvas(layout: Layout) {
  const canvas = document.createElement("canvas");

  canvas.height = layout.dimensions.height;
  canvas.width = layout.dimensions.width;

  canvasContextRenderLoop(canvas, layout);

  document.body.append(canvas);

  return function (layoutUpdate: (layout: Layout) => void) {
    layoutUpdate(layout);
  };
}

export function validateIsLayout(data: any): data is Layout{
  return (
    data.hasOwnProperty("sources") &&
    Array.isArray(data.sources)
  );
}
