import { Layout } from "../../common/Layout";
import { createCanvas, validateIsLayout } from "../../common/Render";
import "./index.scss";

interface BroadcasterViewState {
  layoutUpdater(layoutUpdate: (layout: Layout) => void): void;
}

const state: BroadcasterViewState = {
  layoutUpdater(_: (layout: Layout) => void) {
    return;
  },
};

interface SourceUpdate {
  type: "SourceUpdate";
  source: number;
  x: number;
  y: number;
}

const defaultLayout: Layout = {
  dimensions: {
    width: 1280,
    height: 720,
  },
  sources: [],
};

function isUpdate(data: any): data is SourceUpdate {
  return (
    data.hasOwnProperty("type") &&
    data.hasOwnProperty("source") &&
    data.type === "SourceUpdate" &&
    typeof data.source === "number"
  );
}

// eyJkaW1lbnNpb25zIjp7IndpZHRoIjoxMjgwLCJoZWlnaHQiOjcyMH0sInNvdXJjZXMiOlt7InR5cGUiOiJWaWRlb0RldmljZUNhcHR1cmUiLCJwYXlsb2FkIjp7ImNhbWVyYSI6MH0sImNvbnN0cmFpbnRzIjp7IngiOjAsInkiOjB9fV19

function getLayout(): Layout {
  const blob = new URLSearchParams(window.location.search).get("config");

  if (blob) {
    const data = JSON.parse(atob(blob));
    if (validateIsLayout(data)) {
      return data;
    }
  }

  return defaultLayout;
}

function getChannel() {
  const channel = new URLSearchParams(window.location.search).get("channel");

  if (channel) {
    return channel;
  }

  return "unsafe_idiot";
}

window.addEventListener("load", () => {
  const messagebus = new WebSocket(
    `ws://${location.host}/messagebus/${getChannel()}`
  );
  const layoutUpdater = createCanvas(getLayout());

  messagebus.addEventListener("message", (message) => {
    const data = JSON.parse(message.data);

    console.log(data);

    if (isUpdate(data)) {
      layoutUpdater((layout) => {
        layout.sources[data.source].constraints.x = data.x;
        layout.sources[data.source].constraints.y = data.y;

        const newUrl = new URL(window.location.href);

        newUrl.searchParams.set(
          "config",
          btoa(
            JSON.stringify(layout, function (key, value) {
              if (key === "source") {
                return undefined;
              }
              return value;
            })
          )
        );

        window.history.pushState("", "", newUrl.toString());
      });
    }
  });
});
