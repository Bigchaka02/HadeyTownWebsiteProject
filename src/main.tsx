import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import mapImage from "./assets/full_house_animation/PNG/ExteriorMap.png";
import characterSheet from "./assets/character.png";

// Start fetching the map and character art immediately, before React mounts,
// so they're ready by the time the scene first paints.
for (const href of [mapImage, characterSheet]) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = href;
  document.head.appendChild(link);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
