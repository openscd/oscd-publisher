/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement, TemplateResult } from 'lit';
import {
  customElement,
  property,
  query,
  queryAll,
  state,
} from 'lit/decorators.js';

import '@material/mwc-button';
import type { Button } from '@material/mwc-button';

import { newEditEvent } from '@openscd/open-scd-core';
import { identity, updateReportControl } from '@openenergytools/scl-lib';

import '@openenergytools/scl-checkbox';
import '@openenergytools/scl-select';
// eslint-disable-next-line import/no-duplicates
import '@openenergytools/scl-text-field';
import type { SclCheckbox } from '@openenergytools/scl-checkbox';
import type { SclSelect } from '@openenergytools/scl-select';
// eslint-disable-next-line import/no-duplicates
import { SclTextField } from '@openenergytools/scl-text-field';

import { createElement } from '@openenergytools/scl-lib/dist/foundation/utils.js';
import { maxLength, patterns } from '../../foundation/pattern.js';
import { updateMaxClients } from './foundation.js';

const optFieldsHelpers: Record<string, string> = {
  seqNum: 'Whether Report includes Sequence Number',
  timeStamp: 'Whether Report includes Time Stamp',
  dataSet: 'Whether Report includes DataSet reference',
  reasonCode: 'Whether Report includes reason for trigger',
  dataRef: 'Whether Report includes structure of DataSet',
  entryID: 'Whether Report includes ID for Report',
  configRef: 'Whether Report includes Configuration Revision',
  bufOvfl: 'Whether Report includes indicator for buffer overflow',
};

const trgOpsHelpers: Record<string, string> = {
  dchg: 'Trigger Report through data change',
  qchg: 'Trigger Report through data quality change',
  dupd: 'Trigger Report through data update',
  period: 'Periodically send Report',
  gi: 'Allow trigger Report manually',
};

function checkRptEnabledValidity(
  rptEnabled: Element | null,
  input: SclTextField
): boolean {
  if (!input.checkValidity()) return false;

  if (!rptEnabled) return true;

  const clientLNs = Array.from(
    rptEnabled.querySelectorAll(':scope > ClientLN')
  );
  const maxRpt = input.value ?? '0';

  if (clientLNs.length <= parseInt(maxRpt, 10)) return true;

  input.setCustomValidity(`There are ${clientLNs.length} clientLNs`);
  return false;
}

@customElement('report-control-element-editor')
export class ReportControlElementEditor extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  element: Element | null = null;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = 0;

  @state()
  private optFieldsDiff = false;

  @state()
  private trgOpsDiff = false;

  @state()
  private reportControlDiff = false;

  @queryAll('.content.optfields > scl-checkbox')
  optFieldsInputs!: SclCheckbox[];

  @query('.save.optfields') optFieldsSave!: Button;

  @queryAll('.content.trgops > scl-checkbox')
  trgOpsInputs!: SclCheckbox[];

  @query('.save.trgops') trgOpsSave!: Button;

  @queryAll('.report.attributes')
  reportControlInputs!: (SclTextField | SclSelect | SclCheckbox)[];

  @query('.content.reportcontrol > .save') reportControlSave!: Button;

  @query('.rptenabled.attributes') rptEnabledInput!: SclTextField;

  public resetInputs(): void {
    this.element = null; // removes inputs and forces a re-render

    // reset save button
    this.optFieldsDiff = false;
    this.trgOpsDiff = false;
    this.reportControlDiff = false;

    for (const input of this.reportControlInputs)
      if (input instanceof SclTextField) input.reset();
  }

  private onOptFieldsInputChange(): void {
    const optFields = this.element!.querySelector(':scope > OptFields');

    const optFieldsAttrs: Record<string, string | null> = {};
    for (const input of this.optFieldsInputs)
      optFieldsAttrs[input.label] = input.value;

    this.optFieldsDiff = Array.from(this.optFieldsInputs).some(
      input => optFields?.getAttribute(input.label) !== input.value
    );
  }

  private saveOptFieldChanges(): void {
    if (!this.element) return;

    const optFields = this.element!.querySelector(':scope > OptFields');

    const optFieldAttrs: Record<string, string | null> = {};
    for (const input of this.optFieldsInputs ?? [])
      if (optFields?.getAttribute(input.label) !== input.value)
        optFieldAttrs[input.label] = input.value;

    if (!optFields) {
      const node = createElement(
        this.element.ownerDocument,
        'OptFields',
        optFieldAttrs
      );
      this.dispatchEvent(
        newEditEvent({ parent: this.element, node, reference: null })
      );
    } else {
      const updateEdit = { element: optFields!, attributes: optFieldAttrs };
      this.dispatchEvent(newEditEvent(updateEdit));
    }

    this.onOptFieldsInputChange();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onTrgOpsInputChange(): void {
    if (!this.element) return;

    const trgOps = this.element!.querySelector(':scope > TrgOps');

    const trgOpsAttrs: Record<string, string | null> = {};
    for (const input of this.trgOpsInputs)
      trgOpsAttrs[input.label] = input.value;

    this.trgOpsDiff = Array.from(this.trgOpsInputs).some(
      input => trgOps?.getAttribute(input.label) !== input.value
    );
  }

  private saveTrgOpsChanges(): void {
    if (!this.element) return;

    const trgOps = this.element!.querySelector(':scope > TrgOps');

    const trgOpsAttrs: Record<string, string | null> = {};
    for (const input of this.trgOpsInputs ?? []) {
      if (trgOps?.getAttribute(input.label) !== input.value)
        trgOpsAttrs[input.label] = input.value;
    }

    if (!trgOps) {
      const node = createElement(
        this.element.ownerDocument,
        'TrgOps',
        trgOpsAttrs
      );
      this.dispatchEvent(
        newEditEvent({ parent: this.element, node, reference: null })
      );
    } else {
      const updateEdit = { element: trgOps!, attributes: trgOpsAttrs };
      this.dispatchEvent(newEditEvent(updateEdit));
    }

    this.onTrgOpsInputChange();
  }

  private onReportControlInputChange(): void {
    if (!this.element) return;

    const reportControl = this.element;
    const rptEnabled = reportControl.querySelector(':scope > RptEnabled');

    const someInvalidAttrs = Array.from(this.reportControlInputs).some(
      input => !input.checkValidity()
    );
    if (
      someInvalidAttrs ||
      !checkRptEnabledValidity(rptEnabled, this.rptEnabledInput)
    ) {
      this.reportControlDiff = false;
      return;
    }

    const reportControlAttrs: Record<string, string | null> = {};
    for (const input of this.reportControlInputs)
      reportControlAttrs[input.label] = input.value;

    const someAttrDiff = Array.from(this.reportControlInputs).some(
      input => reportControl?.getAttribute(input.label) !== input.value
    );
    const rptEnabledDiff =
      (rptEnabled?.getAttribute('max') ?? null) !== this.rptEnabledInput.value;
    this.reportControlDiff = someAttrDiff || rptEnabledDiff;
  }

  private saveReportControlChanges(): void {
    const reportControl = this.element;

    const reportControlAttrs: Record<string, string | null> = {};
    for (const input of this.reportControlInputs ?? [])
      if (reportControl!.getAttribute(input.label) !== input.value)
        reportControlAttrs[input.label] = input.value;

    const reportControlActions = updateReportControl({
      element: reportControl!,
      attributes: reportControlAttrs,
    });

    const max = this.rptEnabledInput.value;
    const rptEnabledAction = updateMaxClients(reportControl!, max);

    if (!rptEnabledAction)
      this.dispatchEvent(newEditEvent(reportControlActions));
    else
      this.dispatchEvent(
        newEditEvent([...reportControlActions, rptEnabledAction])
      );

    this.resetInputs();

    this.onReportControlInputChange();
  }

  private renderOptFieldsContent(): TemplateResult {
    const [
      seqNum,
      timeStamp,
      dataSet,
      reasonCode,
      dataRef,
      entryID,
      configRef,
      bufOvfl,
    ] = [
      'seqNum',
      'timeStamp',
      'dataSet',
      'reasonCode',
      'dataRef',
      'entryID',
      'configRef',
      'bufOvfl',
    ].map(
      attr =>
        this.element!.querySelector('OptFields')?.getAttribute(attr) ?? null
    );

    return html`<div class="content optfields">
        <h3>Optional Fields</h3>
        ${Object.entries({
          seqNum,
          timeStamp,
          dataSet,
          reasonCode,
          dataRef,
          entryID,
          configRef,
          bufOvfl,
        }).map(
          ([key, value]) =>
            html`<scl-checkbox
              label="${key}"
              .value=${value}
              nullable
              supportingText="${optFieldsHelpers[key]}"
              @input=${this.onOptFieldsInputChange}
            ></scl-checkbox>`
        )}
      </div>
      <mwc-button
        class="save optfields"
        label="save"
        icon="save"
        ?disabled=${!this.optFieldsDiff}
        @click=${() => this.saveOptFieldChanges()}
      ></mwc-button>`;
  }

  private renderTrgOpsContent(): TemplateResult {
    const [dchg, qchg, dupd, period, gi] = [
      'dchg',
      'qchg',
      'dupd',
      'period',
      'gi',
    ].map(
      attr => this.element!.querySelector('TrgOps')?.getAttribute(attr) ?? null
    );

    return html`<div class="content trgops">
        <h3>Trigger Options</h3>
        ${Object.entries({ dchg, qchg, dupd, period, gi }).map(
          ([key, value]) =>
            html`<scl-checkbox
              label="${key}"
              .value=${value}
              nullable
              supportingText="${trgOpsHelpers[key]}"
              @input=${async (evt: Event) => {
                await (evt.target as SclCheckbox).updateComplete;
                this.onTrgOpsInputChange();
              }}
            ></scl-checkbox>`
        )}
      </div>
      <mwc-button
        class="save trgops"
        label="save"
        icon="save"
        ?disabled=${!this.trgOpsDiff}
        @click=${() => this.saveTrgOpsChanges()}
      ></mwc-button>`;
  }

  private renderChildElements(): TemplateResult {
    return html`<div class="content">
      ${this.renderTrgOpsContent()}${this.renderOptFieldsContent()}
    </div>`;
  }

  private renderReportControlContent(): TemplateResult {
    const [name, desc, confRev, buffered, rptID, indexed, bufTime, intgPd] = [
      'name',
      'desc',
      'confRev',
      'buffered',
      'rptID',
      'indexed',
      'bufTime',
      'intgPd',
    ].map(attr => this.element?.getAttribute(attr));
    const max =
      this.element!.querySelector('RptEnabled')?.getAttribute('max') ?? null;

    return html`<div class="content reportcontrol">
      <scl-text-field
        class="report attributes"
        label="name"
        .value=${name}
        supportingText="ReportControl Name"
        required
        pattern="${patterns.asciName}"
        maxLength="${maxLength.cbName}"
        dialogInitialFocus
        @input=${this.onReportControlInputChange}
      ></scl-text-field
      ><scl-text-field
        class="report attributes"
        label="desc"
        .value=${desc}
        nullable
        supportingText="ReportControl Description"
        @input=${this.onReportControlInputChange}
      ></scl-text-field>
      <scl-text-field
        class="input gsecontrol"
        label="confRev"
        .value=${confRev}
        supportingText="Configuration Revision"
        pattern="${patterns.unsigned}"
        nullable
        @input=${this.onReportControlInputChange}
      ></scl-text-field>
      <scl-checkbox
        class="report attributes"
        label="buffered"
        .value=${buffered}
        helper="Whether ReportControl is Buffered"
        @input=${this.onReportControlInputChange}
      ></scl-checkbox
      ><scl-text-field
        class="report attributes"
        label="rptID"
        .value=${rptID}
        nullable
        supportingText="ReportControl ID"
        @input=${this.onReportControlInputChange}
      ></scl-text-field
      ><scl-checkbox
        class="report attributes"
        label="indexed"
        .value=${indexed}
        nullable
        helper="Allow multiple Instances of this ReportControl"
        @input=${this.onReportControlInputChange}
      ></scl-checkbox
      ><scl-text-field
        class="rptenabled attributes"
        label="max Clients"
        .value=${max}
        supportingText="Number of ReportControl Instances"
        nullable
        type="number"
        min="0"
        suffix="#"
        @input=${this.onReportControlInputChange}
      ></scl-text-field
      ><scl-text-field
        class="report attributes"
        label="bufTime"
        .value=${bufTime}
        supportingText="Minimum time between two ReportControl"
        nullable
        required
        type="number"
        min="0"
        suffix="ms"
        @input=${this.onReportControlInputChange}
      ></scl-text-field
      ><scl-text-field
        class="report attributes"
        label="intgPd"
        .value=${intgPd}
        supportingText="Integrity Period"
        nullable
        required
        type="number"
        min="0"
        suffix="ms"
        @input=${this.onReportControlInputChange}
      ></scl-text-field>
      <mwc-button
        class="save"
        label="save"
        icon="save"
        ?disabled=${!this.reportControlDiff}
        @click=${() => this.saveReportControlChanges()}
      ></mwc-button>
    </div>`;
  }

  render(): TemplateResult {
    if (this.element)
      return html`<h2 style="display: flex;">
          <div style="flex:auto">
            <div>ReportControl</div>
            <div class="headersubtitle">${identity(this.element)}</div>
          </div>
        </h2>
        <div class="parentcontent">
          ${this.renderReportControlContent()}${this.renderChildElements()}
        </div>`;

    return html`<div class="parentcontent">
      <h2>No ReportControl loaded</h2>
    </div>`;
  }

  static styles = css`
    .parentcontent {
      display: grid;
      grid-gap: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    .content {
      display: flex;
      flex-direction: column;
      border-left: thick solid var(--mdc-theme-on-primary);
    }

    .content > * {
      display: block;
      margin: 4px 8px 16px;
    }

    .save {
      align-self: flex-end;
    }

    h2,
    h3 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      margin: 4px 8px 16px;
      padding-left: 0.3em;
    }

    .headersubtitle {
      font-size: 16px;
      font-weight: 200;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    *[iconTrailing='search'] {
      --mdc-shape-small: 28px;
    }

    @media (max-width: 950px) {
      .parentcontent {
        border-left: 0px solid var(--mdc-theme-on-primary);
      }
    }
  `;
}
