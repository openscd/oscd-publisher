/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { MdRadio } from '@scopedelement/material-web/radio/radio.js';

import { DataSetEditor } from './editors/dataset/data-set-editor.js';
import { GseControlEditor } from './editors/gsecontrol/gse-control-editor.js';
import { ReportControlEditor } from './editors/report/report-control-editor.js';
import { SampledValueControlEditor } from './editors/sampledvalue/sampled-value-control-editor.js';

/** An editor [[`plugin`]] to configure `Report`, `GOOSE`, `SampledValue` control blocks and its `DataSet` */
export default class PublisherPlugin extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'md-radio': MdRadio,
    'report-control-editor': ReportControlEditor,
    'gse-control-editor': GseControlEditor,
    'sampled-value-control-editor': SampledValueControlEditor,
    'data-set-editor': DataSetEditor,
  };

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
    return html`<form class="publishertypeselector">
        <span>
          <md-radio
            id="report-radio"
            value="report"
            ?checked=${this.publisherType === 'Report'}
            @change=${() => {
              this.publisherType = 'Report';
            }}
          ></md-radio>
          <label for="report-radio">Report</label>
        </span>
        <span>
          <md-radio
            id="goose-radio"
            value="goose"
            ?checked=${this.publisherType === 'GOOSE'}
            @change=${() => {
              this.publisherType = 'GOOSE';
            }}
          ></md-radio>
          <label for="goose-radio">GOOSE</label>
        </span>
        <span>
          <md-radio
            id="smv-radio"
            value="smv"
            ?checked=${this.publisherType === 'SampledValue'}
            @change=${() => {
              this.publisherType = 'SampledValue';
            }}
          ></md-radio>
          <label for="smv-radio">SampledValue</label>
        </span>
        <span>
          <md-radio
            id="ds-radio"
            value="ds"
            ?checked=${this.publisherType === 'DataSet'}
            @change=${() => {
              this.publisherType = 'DataSet';
            }}
          ></md-radio>
          <label for="ds-radio">DataSet</label>
        </span>
      </form>
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
      --md-dialog-container-color: var(--oscd-base3);

      --md-list-item-activated-background: rgb(
        from var(--oscd-primary) r g b / 0.38
      );
    }

    .hidden {
      display: none;
    }

    .publishertypeselector {
      margin: 4px 8px 8px;
      padding: 8px;
      background-color: var(--oscd-theme-surface);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, auto));
      gap: 5px;
    }

    .publishertypeselector > span > label {
      margin-left: 10px;
    }
  `;
}
