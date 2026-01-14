import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'

// Load theme from localStorage BEFORE React renders (prevents flicker)
const rootElement = document.getElementById('root')!;
const savedTheme = localStorage.getItem('user-theme');
if (savedTheme) {
  try {
    const theme = JSON.parse(savedTheme);
    const root = rootElement;
    // Map theme object keys to CSS variables
    const themeKeyToCssVar = (key: string): string => {
      const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `--color-${kebabCase}`;
    };
    // Apply immediately to prevent flash
    Object.entries(theme).forEach(([key, value]) => {
      const cssVar = themeKeyToCssVar(key);
      root.style.setProperty(cssVar, value as string);
    });
    // Also apply --color-bg to html so body element can use it
    // (body is a parent of #root, so it can't access variables defined on #root)
    if (theme.bg) {
      document.documentElement.style.setProperty('--color-bg', theme.bg);
    }
  } catch {
    // Ignore parse errors, will use defaults
  }
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
