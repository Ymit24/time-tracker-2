import "./App.css";

import { ThemeProvider } from "./components/theme-provider";
import TimeTracker from "./TimeTracker";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TimeTracker />
    </ThemeProvider>
  );
}

export default App;
