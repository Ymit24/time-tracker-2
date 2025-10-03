import './App.css'
import { ModeToggle } from './components/mode-toggle'
import { ThemeProvider } from './components/theme-provider'
import TimeTracker from './TimeTracker'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed right-2 top-2">
        <ModeToggle />
      </div>
      <TimeTracker />
    </ThemeProvider>
  )
}

export default App
