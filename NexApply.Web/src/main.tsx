import { Fragment, StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Remove loader after React mounts
function AppWithLoader() {
  useEffect(() => {
    const loader = document.getElementById('root-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.3s ease';
      setTimeout(() => loader.remove(), 300);
    }
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  // NOTE:
  // React StrictMode intentionally double-invokes certain lifecycle paths in DEV,
  // which can look like "double render" / "double fetch" when navigating.
  // Keep it opt-in via env var so day-to-day dev is not noisy:
  //   VITE_STRICT_MODE=true npm run dev
  (() => {
    const Root = import.meta.env.VITE_STRICT_MODE === 'true' ? StrictMode : Fragment
    return (
      <Root>
        <AppWithLoader />
      </Root>
    )
  })(),
)
