import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import '@material/mwc-radio';
import '@material/mwc-formfield';

import './editors/report/report-control-editor.js';
import './editors/gsecontrol/gse-control-editor.js';
import './editors/dataset/data-set-editor.js';
import './editors/sampledvalue/sampled-value-control-editor.js';

/** An editor [[`plugin`]] to configure `Report`, `GOOSE`, `SampledValue` control blocks and its `DataSet` */
export default class PublisherPlugin extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = 0;

  @state()
  private publisherType: 'Report' | 'GOOSE' | 'SampledValue' | 'DataSet' =
    'GOOSE';

  render() {
    return html`<div class="publishertypeselector">
        <mwc-formfield label="Report"
          ><mwc-radio
            value="Report"
            ?checked=${this.publisherType === 'Report'}
            eslint-disable-next-line
            no-return-assign
            @checked=${() => {
              this.publisherType = 'Report';
            }}
          ></mwc-radio></mwc-formfield
        ><mwc-formfield label="GOOSE"
          ><mwc-radio
            value="GOOSE"
            ?checked=${this.publisherType === 'GOOSE'}
            @checked=${() => {
              this.publisherType = 'GOOSE';
            }}
          ></mwc-radio></mwc-formfield
        ><mwc-formfield label="SampledValue"
          ><mwc-radio
            value="SampledValue"
            ?checked=${this.publisherType === 'SampledValue'}
            @checked=${() => {
              this.publisherType = 'SampledValue';
            }}
          ></mwc-radio></mwc-formfield
        ><mwc-formfield label="DataSet"
          ><mwc-radio
            value="DataSet"
            ?checked=${this.publisherType === 'DataSet'}
            @checked=${() => {
              this.publisherType = 'DataSet';
            }}
          ></mwc-radio
        ></mwc-formfield>
      </div>
      <report-control-editor
        .doc=${this.doc}
        editCount="${this.editCount}"
        class="${classMap({
          hidden: this.publisherType !== 'Report',
        })}"
      ></report-control-editor
      ><gse-control-editor
        .doc=${this.doc}
        editCount="${this.editCount}"
        class="${classMap({
          hidden: this.publisherType !== 'GOOSE',
        })}"
      ></gse-control-editor
      ><sampled-value-control-editor
        .doc=${this.doc}
        editCount="${this.editCount}"
        class="${classMap({
          hidden: this.publisherType !== 'SampledValue',
        })}"
      ></sampled-value-control-editor
      ><data-set-editor
        .doc=${this.doc}
        editCount="${this.editCount}"
        class="${classMap({
          hidden: this.publisherType !== 'DataSet',
        })}"
      ></data-set-editor>`;
  }

  static styles = css`
    * {
      --md-sys-color-primary: var(--oscd-primary);
      --md-sys-color-secondary: var(--oscd-secondary);
      --md-sys-typescale-body-large-font: var(--oscd-theme-text-font);
      --md-outlined-text-field-input-text-color: var(--oscd-base01);

      --md-sys-color-surface: var(--oscd-base3);
      --md-sys-color-on-surface: var(--oscd-base00);
      --md-sys-color-on-primary: var(--oscd-base2);
      --md-sys-color-on-surface-variant: var(--oscd-base00);
      --md-menu-container-color: var(--oscd-base3);
      font-family: var(--oscd-theme-text-font);
      --md-sys-color-surface-container-highest: var(--oscd-base2);
    }

    .hidden {
      display: none;
    }

    .publishertypeselector {
      margin: 4px 8px 8px;
      background-color: var(--mdc-theme-surface);
      width: calc(100% - 16px);
      justify-content: space-around;
    }
  `;
}
