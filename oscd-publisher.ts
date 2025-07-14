/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { MdRadio } from '@scopedelement/material-web/radio/radio.js';

import { DataSetEditor } from './editors/dataset/data-set-editor.js';
import { GseControlEditor } from './editors/gsecontrol/gse-control-editor.js';
import { ReportControlEditor } from './editors/report/report-control-editor.js';
import { SampledValueControlEditor } from './editors/sampledvalue/sampled-value-control-editor.js';

type PublisherType = 'Report' | 'GOOSE' | 'SampledValue' | 'DataSet';

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
  private publisherType: PublisherType = 'GOOSE';

  private filterValues: Record<PublisherType, string> = {
    Report: '',
    GOOSE: '',
    SampledValue: '',
    DataSet: '',
  };

  private handleSearchChange =
    (type: PublisherType) => (event: CustomEvent) => {
      this.filterValues[type] = event.detail.value;
      this.requestUpdate();
    };

  private handlePublisherTypeChange(newType: PublisherType) {
    this.publisherType = newType;
  }

  private renderEditor() {
    switch (this.publisherType) {
      case 'Report':
        return html`<report-control-editor
          .doc=${this.doc}
          .editCount=${this.editCount}
          .searchValue=${this.filterValues.Report}
          @search-change=${this.handleSearchChange('Report')}
        ></report-control-editor>`;
      case 'GOOSE':
        return html`<gse-control-editor
          .doc=${this.doc}
          .editCount=${this.editCount}
          .searchValue=${this.filterValues.GOOSE}
          @search-change=${this.handleSearchChange('GOOSE')}
        ></gse-control-editor>`;
      case 'SampledValue':
        return html`<sampled-value-control-editor
          .doc=${this.doc}
          .editCount=${this.editCount}
          .searchValue=${this.filterValues.SampledValue}
          @search-change=${this.handleSearchChange('SampledValue')}
        ></sampled-value-control-editor>`;
      case 'DataSet':
        return html`<data-set-editor
          .doc=${this.doc}
          .editCount=${this.editCount}
          .searchValue=${this.filterValues.DataSet}
          @search-change=${this.handleSearchChange('DataSet')}
        ></data-set-editor>`;
      default:
        return nothing;
    }
  }

  render() {
    return html`<form class="publishertypeselector">
        <span>
          <md-radio
            id="report-radio"
            value="report"
            ?checked=${this.publisherType === 'Report'}
            @change=${() => this.handlePublisherTypeChange('Report')}
          ></md-radio>
          <label for="report-radio">Report</label>
        </span>
        <span>
          <md-radio
            id="goose-radio"
            value="goose"
            ?checked=${this.publisherType === 'GOOSE'}
            @change=${() => this.handlePublisherTypeChange('GOOSE')}
          ></md-radio>
          <label for="goose-radio">GOOSE</label>
        </span>
        <span>
          <md-radio
            id="smv-radio"
            value="smv"
            ?checked=${this.publisherType === 'SampledValue'}
            @change=${() => this.handlePublisherTypeChange('SampledValue')}
          ></md-radio>
          <label for="smv-radio">SampledValue</label>
        </span>
        <span>
          <md-radio
            id="ds-radio"
            value="ds"
            ?checked=${this.publisherType === 'DataSet'}
            @change=${() => this.handlePublisherTypeChange('DataSet')}
          ></md-radio>
          <label for="ds-radio">DataSet</label>
        </span>
      </form>
      ${this.renderEditor()} `;
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
      font-family: var(--oscd-theme-text-font, Roboto);
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
