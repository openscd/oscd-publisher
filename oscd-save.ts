import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export default class OscdSave extends LitElement {
  @property() doc!: XMLDocument;

  @property() docName!: string;

  async run() {
    if (this.doc) {
      const blob = new Blob([new XMLSerializer().serializeToString(this.doc)], {
        type: 'application/xml',
      });

      const a = document.createElement('a');
      a.download = this.docName;
      a.href = URL.createObjectURL(blob);
      a.dataset.downloadurl = ['application/xml', a.download, a.href].join(':');
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
      }, 5000); // TODO(ca-d): discuss revoke timeout length
    }
  }

  render() {
    return html`<button @click=${() => this.run()}>Save project</button>`;
  }
}
