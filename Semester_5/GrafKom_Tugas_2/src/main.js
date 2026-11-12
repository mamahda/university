import './styles/main.css';
import { createApp } from './core/createApp.js';
import { bindUI } from './ui/bindUI.js';

const app = createApp(document.querySelector('#canvas-host'));
bindUI(app);
// Development only: lets browser tests read the model state. Not part of the production build.
if (import.meta.env.DEV) window.__ccws = app;

window.addEventListener('beforeunload', () => app?.dispose());
