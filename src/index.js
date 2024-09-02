import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <StarRating
      maxRating={5}
      messages={["terrible", "bad", "good", "best", "amazing"]}
      defaultRating={5}
    /> */}
    <App />
  </React.StrictMode>
);
