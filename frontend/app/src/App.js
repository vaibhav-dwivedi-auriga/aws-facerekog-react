import React from "react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { LivenessComponent } from "./LivenessComponent";

export default function App() {
  return (
    <ThemeProvider>
      <LivenessComponent />
    </ThemeProvider>
  );
}
