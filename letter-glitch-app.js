import React from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import LetterGlitch from './LetterGlitch.js';

const rootElement = document.getElementById('letter-glitch-root');

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    React.createElement(LetterGlitch, {
      glitchSpeed: 50,
      centerVignette: true,
      outerVignette: false,
      smooth: true,
      className: 'hero-letter-glitch'
    })
  );
}
