import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppWithLoader } from './components/AppWithLoader'

createRoot(document.getElementById('root')!).render(
  (() => {
    const Root = import.meta.env.VITE_STRICT_MODE === 'true' ? StrictMode : Fragment
    return (
      <Root>
        <AppWithLoader />
      </Root>
    )
  })(),
)
