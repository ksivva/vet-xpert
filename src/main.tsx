
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// More robust error handling for debugging deployment issues
try {
  // Ensure the root element exists before mounting
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found - DOM may not be fully loaded");
    document.addEventListener('DOMContentLoaded', () => {
      const retryRoot = document.getElementById("root");
      if (retryRoot) {
        console.log("Root element found after DOMContentLoaded");
        createRoot(retryRoot).render(<App />);
      } else {
        console.error("Fatal: Root element still not found after DOM loaded");
      }
    });
  } else {
    console.log("Mounting app to root element");
    createRoot(rootElement).render(<App />);
  }
} catch (error) {
  console.error("Error rendering app:", error);
  // Display a visible error to users rather than blank page
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
        <h3>Something went wrong</h3>
        <p>The application couldn't be loaded. Please try again later.</p>
        <p>Error details: ${error instanceof Error ? error.message : String(error)}</p>
        <button onclick="window.location.reload()" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}
