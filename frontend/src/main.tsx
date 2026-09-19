import "@xyflow/react/dist/style.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./appearance/backgrounds/staticBackgrounds.css";
import "./appearance/themes/standardVariants.css";
import "./appearance/themes/canvasStyleEditor.css";
import "./appearance/themes/blueprintSeries.css";
import "./appearance/themes/tilePresentations.css";
import "./appearance/themes/coverReveal.css";
import "./appearance/themes/revealer.css";
import "./appearance/themes/revealerLite.css";
import "./appearance/themes/stellar.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
