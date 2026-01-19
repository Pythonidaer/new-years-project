import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, defaultTheme } from './context/ThemeContext'

// Handle chunk load errors - automatically reload when dynamic imports fail
// This happens when build filenames change and browser has cached old chunks
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const error = event.error || event.message || '';
    const isChunkLoadError = 
      typeof error === 'string' && (
        error.includes('Failed to fetch dynamically imported module') ||
        error.includes('Loading chunk') ||
        error.includes('Loading CSS chunk')
      );
    
    if (isChunkLoadError) {
      // Only reload if we haven't already tried recently (prevent infinite loops)
      const lastReload = sessionStorage.getItem('chunkReloadAttempt');
      const now = Date.now();
      
      if (!lastReload || (now - parseInt(lastReload)) > 10000) { // 10 second cooldown
        sessionStorage.setItem('chunkReloadAttempt', now.toString());
        window.location.reload();
      }
    }
  });

  // Also handle unhandled promise rejections (lazy() throws promises)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason?.message || event.reason || '';
    const isChunkLoadError = 
      typeof error === 'string' && (
        error.includes('Failed to fetch dynamically imported module') ||
        error.includes('Loading chunk') ||
        error.includes('Loading CSS chunk')
      );
    
    if (isChunkLoadError) {
      event.preventDefault(); // Prevent error from being logged
      const lastReload = sessionStorage.getItem('chunkReloadAttempt');
      const now = Date.now();
      
      if (!lastReload || (now - parseInt(lastReload)) > 10000) {
        sessionStorage.setItem('chunkReloadAttempt', now.toString());
        window.location.reload();
      }
    }
  });
}

// Map theme object keys to CSS variables
const themeKeyToCssVar = (key: string): string => {
  const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `--color-${kebabCase}`;
};

// Apply theme to DOM (used before React renders to prevent flicker)
const applyThemeToDom = (theme: typeof defaultTheme) => {
  const root = document.getElementById('root');
  if (!root) return;

  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = themeKeyToCssVar(key);
    root.style.setProperty(cssVar, value as string);
  });

  // Also apply --color-bg to html so body element can use it
  // (body is a parent of #root, so it can't access variables defined on #root)
  if (theme.bg) {
    document.documentElement.style.setProperty('--color-bg', theme.bg);
  }
};

// Load theme from localStorage BEFORE React renders (prevents flicker)
const rootElement = document.getElementById('root')!;
const savedTheme = localStorage.getItem('user-theme');
if (savedTheme) {
  try {
    const theme = JSON.parse(savedTheme);
    applyThemeToDom(theme);
  } catch {
    // If parsing fails, apply default theme instead of showing orange CSS defaults
    applyThemeToDom(defaultTheme);
  }
} else {
  // No saved theme - apply default theme to prevent orange flash from CSS defaults
  applyThemeToDom(defaultTheme);
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
