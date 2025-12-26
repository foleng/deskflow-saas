import { render } from 'preact';
import App from './App';
// Critical: Add ?inline suffix so Vite processes CSS as string instead of a separate file
import styles from './index.css?inline'; 

class DeskFlowWidget extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // 1. Get configuration from attributes
    const websiteId = this.getAttribute('data-website-id');
    
    // 2. Create Shadow DOM (Style Sandbox)
    // Check if shadow root already exists to avoid error if connectedCallback runs multiple times
    if (!this.shadowRoot) {
        const shadow = this.attachShadow({ mode: 'open' });

        // 3. Inject Styles (Tailwind CSS)
        const styleTag = document.createElement('style');
        styleTag.textContent = styles;
        shadow.appendChild(styleTag);

        // 4. Create Mount Point
        const mountPoint = document.createElement('div');
        mountPoint.id = 'deskflow-root'; 
        shadow.appendChild(mountPoint);

        // 5. Render Preact App
        render(<App websiteId={websiteId} />, mountPoint);
    }
  }
}

// Register Web Component
if (!customElements.get('deskflow-widget')) {
    customElements.define('deskflow-widget', DeskFlowWidget);
}
