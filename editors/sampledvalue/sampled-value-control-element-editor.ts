/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement, TemplateResult } from 'lit';
import {
  customElement,
  property,
  query,
  queryAll,
  state,
} from 'lit/decorators.js';
import { newEditEvent } from '@openscd/open-scd-core';
import {
  ChangeGseOrSmvAddressOptions,
  changeSMVContent,
  controlBlockGseOrSmv,
  identity,
  updateSampledValueControl,
} from '@openenergytools/scl-lib';

import '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import type { Button } from '@material/mwc-button';
import type { Checkbox } from '@material/mwc-checkbox';

import '@openenergytools/scl-checkbox';
import '@openenergytools/scl-select';
// eslint-disable-next-line import/no-duplicates
import '@openenergytools/scl-text-field';
import type { SclCheckbox } from '@openenergytools/scl-checkbox';
import type { SclSelect } from '@openenergytools/scl-select';
// eslint-disable-next-line import/no-duplicates
import { SclTextField } from '@openenergytools/scl-text-field';

import {
  maxLength,
  patterns,
  typeNullable,
  typePattern,
} from '../../foundation/pattern.js';

import { checkSMVDiff } from '../../foundation/utils/smv.js';

function pElementContent(smv: Element, type: string): string | null {
  return (
    Array.from(smv.querySelectorAll(':scope > Address > P'))
      .find(p => p.getAttribute('type') === type)
      ?.textContent?.trim() ?? null
  );
}

const smvOptsHelpers: Record<string, string> = {
  refreshTime: 'SMV stream includes refresh time',
  sampleSynchronized: 'SMV stream includes synchronized information',
  sampleRate: 'SMV streams includes sampled rate information',
  dataSet: 'SMV streams includes data set reference',
  security: 'SMV streams includes security setting',
  timestamp: 'SMV streams includes time stamp information',
  synchSourceId: 'SMV streams includes synchronization source',
};

const smvHelpers: Record<string, string> = {
  'MAC-Address': 'MAC address (01-0C-CD-04-xx-xx)',
  APPID: 'APP ID (4xxx in hex)',
  'VLAN-ID': 'VLAN ID (XXX in hex)',
  'VLAN-PRIORITY': 'VLAN Priority (0-7)',
};

const smvPlaceholders: Record<string, string> = {
  'MAC-Address': '01-0C-CD-02-xx-xx',
  APPID: '4xxx',
  'VLAN-ID': '000',
  'VLAN-PRIORITY': '4',
};

@customElement('sampled-value-control-element-editor')
export class SampledValueControlElementEditor extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  element: Element | null = null;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = -1;

  @property({ attribute: false })
  get sMV(): Element | null {
    return this.element ? controlBlockGseOrSmv(this.element!) : null;
  }

  @state()
  private sMVdiff = false;

  @state()
  private smvOptsDiff = false;

  @state()
  private sampledValueControlDiff = false;

  @queryAll('.smvcontrol.attribute')
  sampledValueControlInputs!: (SclTextField | SclSelect | SclCheckbox)[];

  @query('.smvcontrol.save') smvControlSave!: Button;

  @queryAll('.smv.attribute') sMVInputs!: SclTextField[];

  @query('.smv.save') smvSave!: Button;

  @queryAll('.smvopts.attribute') smvOptsInputs!: SclCheckbox[];

  @query('.smvopts.save') smvOptsSave!: Button;

  @query('.smv.insttype') instType?: Checkbox;

  public resetInputs(
    type: 'SampledValueControl' | 'SMV' = 'SampledValueControl'
  ): void {
    this.element = null; // removes inputs and forces a re-render

    // resets save button
    this.sMVdiff = false;
    this.sampledValueControlDiff = false;

    if (type === 'SampledValueControl')
      for (const input of this.sampledValueControlInputs)
        if (input instanceof SclTextField) input.reset();

    if (type === 'SMV')
      for (const input of this.sMVInputs)
        if (input instanceof SclTextField) input.reset();
  }

  private onSampledValueControlInputChange(): void {
    if (
      Array.from(this.sampledValueControlInputs).some(
        input => !input.reportValidity()
      )
    ) {
      this.sampledValueControlDiff = false;
      return;
    }

    const sampledValueControlAttrs: Record<string, string | null> = {};
    for (const input of this.sampledValueControlInputs)
      sampledValueControlAttrs[input.label] = input.value;

    this.sampledValueControlDiff = Array.from(
      this.sampledValueControlInputs
    ).some(input => this.element?.getAttribute(input.label) !== input.value);
  }

  private saveSampledValueControlChanges(): void {
    if (!this.element) return;

    const sampledValueControlAttrs: Record<string, string | null> = {};
    for (const input of this.sampledValueControlInputs)
      if (this.element?.getAttribute(input.label) !== input.value)
        sampledValueControlAttrs[input.label] = input.value;

    this.dispatchEvent(
      newEditEvent(
        updateSampledValueControl({
          element: this.element,
          attributes: sampledValueControlAttrs,
        })
      )
    );

    this.resetInputs();

    this.onSampledValueControlInputChange();
  }

  private onSMVInputChange(): void {
    if (!this.sMV) return;

    if (Array.from(this.sMVInputs).some(input => !input.reportValidity())) {
      this.sMVdiff = false;
      return;
    }

    const pTypes: Record<string, string | null> = {};
    for (const input of this.sMVInputs) pTypes[input.label] = input.value;

    this.sMVdiff = checkSMVDiff(this.sMV!, {
      pTypes,
      instType: this.instType?.checked,
    });
  }

  private saveSMVChanges(): void {
    if (!this.sMV) return;

    const options: ChangeGseOrSmvAddressOptions = {};
    for (const input of this.sMVInputs) {
      if (input.label === 'MAC-Address' && input.value)
        options.mac = input.value;
      if (input.label === 'APPID' && input.value) options.appId = input.value;
      if (input.label === 'VLAN-ID' && input.value)
        options.vlanId = input.value;
      if (input.label === 'VLAN-PRIORITY' && input.value)
        options.vlanPriority = input.value;
    }

    if (this.instType?.checked === true) options.instType = true;
    else if (this.instType?.checked === false) options.instType = false;

    this.dispatchEvent(newEditEvent(changeSMVContent(this.sMV, options)));

    this.resetInputs('SMV');

    this.onSMVInputChange();
  }

  private onSmvOptsInputChange(): void {
    if (!this.element) return;

    const smvOpts = this.element.querySelector(':scope > SmvOpts');

    const smvOptsAttrs: Record<string, string | null> = {};
    for (const input of this.smvOptsInputs)
      smvOptsAttrs[input.label] = input.value;

    this.smvOptsDiff = Array.from(this.smvOptsInputs).some(
      input => smvOpts?.getAttribute(input.label) !== input.value
    );
  }

  private saveSmvOptsChanges(): void {
    const smvOpts = this.element!.querySelector(':scope > SmvOpts');

    if (!smvOpts) return;

    const smvOptsAttrs: Record<string, string | null> = {};
    for (const input of this.smvOptsInputs)
      if (smvOpts.getAttribute(input.label) !== input.value)
        smvOptsAttrs[input.label] = input.value;

    const updateEdit = { element: smvOpts, attributes: smvOptsAttrs };
    this.dispatchEvent(newEditEvent(updateEdit));

    this.onSmvOptsInputChange();
  }

  private renderSmvContent(): TemplateResult {
    const { sMV } = this;
    if (!sMV)
      return html` <h3>
        <div>Communication Settings (SMV)</div>
        <div class="headersubtitle">No connection available</div>
      </h3>`;

    const hasInstType = Array.from(
      sMV.querySelectorAll(':scope > Address > P')
    ).some(pType => pType.getAttribute('xsi:type'));

    const attributes: Record<string, string | null> = {};

    ['MAC-Address', 'APPID', 'VLAN-ID', 'VLAN-PRIORITY'].forEach(key => {
      if (!attributes[key]) attributes[key] = pElementContent(sMV, key);
    });

    return html` <div class="content smv">
        <h3>Communication Settings (SMV)</h3>
        <mwc-formfield label="Add XMLSchema-instance type"
          ><mwc-checkbox
            class="smv insttype"
            ?checked="${hasInstType}"
            @change=${this.onSMVInputChange}
          ></mwc-checkbox></mwc-formfield
        >${Object.entries(attributes).map(
          ([key, value]) =>
            html`<scl-text-field
              class="smv attribute"
              label="${key}"
              ?nullable=${typeNullable[key]}
              .value=${value}
              pattern="${typePattern[key]!}"
              required
              supportingText="${smvHelpers[key]}"
              placeholder="${smvPlaceholders[key]}"
              @input=${this.onSMVInputChange}
            ></scl-text-field>`
        )}
      </div>
      <mwc-button
        class="smv save"
        label="save"
        icon="save"
        ?disabled=${!this.sMVdiff}
        @click=${() => this.saveSMVChanges()}
      ></mwc-button>`;
  }

  private renderSmvOptsContent(): TemplateResult {
    const [
      refreshTime,
      sampleSynchronized,
      sampleRate,
      dataSet,
      security,
      timestamp,
      synchSourceId,
    ] = [
      'refreshTime',
      'sampleSynchronized',
      'sampleRate',
      'dataSet',
      'security',
      'timestamp',
      'synchSourceId',
    ].map(
      attr => this.element!.querySelector('SmvOpts')?.getAttribute(attr) ?? null
    );

    return html`<div class="content smvopts">
        <h3>Sampled Value Options</h3>
        ${Object.entries({
          refreshTime,
          sampleSynchronized,
          sampleRate,
          dataSet,
          security,
          timestamp,
          synchSourceId,
        }).map(
          ([key, value]) =>
            html`<scl-checkbox
              class="smvopts attribute"
              label="${key}"
              .value=${value}
              nullable
              helper="${smvOptsHelpers[key]}"
              @input=${this.onSmvOptsInputChange}
            ></scl-checkbox>`
        )}
      </div>
      <mwc-button
        class="smvopts save"
        label="save"
        icon="save"
        ?disabled=${!this.smvOptsDiff}
        @click=${() => this.saveSmvOptsChanges()}
      ></mwc-button>`;
  }

  private renderOtherElements(): TemplateResult {
    return html`<div class="content">
      ${this.renderSmvOptsContent()}${this.renderSmvContent()}
    </div>`;
  }

  private renderSmvControlContent() {
    const [
      name,
      desc,
      confRev,
      multicast,
      smvID,
      smpMod,
      smpRate,
      nofASDU,
      securityEnabled,
    ] = [
      'name',
      'desc',
      'confRev',
      'multicast',
      'smvID',
      'smpMod',
      'smpRate',
      'nofASDU',
      'securityEnabled',
    ].map(attr => this.element?.getAttribute(attr));

    return html`<div class="content smvcontrol">
      <scl-text-field
        class="smvcontrol attribute"
        label="name"
        .value=${name}
        supportingText="Sampled Value Name"
        required
        pattern="${patterns.asciName}"
        maxLength="${maxLength.cbName}"
        dialogInitialFocus
        @input="${this.onSampledValueControlInputChange}"
      ></scl-text-field>
      <scl-text-field
        class="smvcontrol attribute"
        label="desc"
        .value=${desc}
        nullable
        supportingText="Sampled Value Description"
        @input="${this.onSampledValueControlInputChange}"
      ></scl-text-field>
      ${multicast === null || multicast === 'true'
        ? html``
        : html`<scl-checkbox
            class="smvcontrol attribute"
            label="multicast"
            .value=${multicast}
            supportingText="Whether Sample Value Stream is multicast"
            @input="${this.onSampledValueControlInputChange}"
          ></scl-checkbox>`}
      <scl-text-field
        class="smvcontrol attribute"
        label="confRev"
        .value=${confRev}
        supportingText="Configuration Revision"
        pattern="${patterns.unsigned}"
        nullable
        @input=${this.onSampledValueControlInputChange}
      ></scl-text-field>
      <scl-text-field
        class="smvcontrol attribute"
        label="smvID"
        .value=${smvID}
        supportingText="Sampled Value ID"
        required
        @input="${this.onSampledValueControlInputChange}"
      ></scl-text-field>
      <scl-select
        class="smvcontrol attribute"
        label="smpMod"
        .value=${smpMod}
        nullable
        required
        supportingText="Sample mode (Samples per Second, Sampled per Period, Seconds per Sample)"
        @input="${this.onSampledValueControlInputChange}"
        .selectOptions=${['SmpPerPeriod', 'SmpPerSec', 'SecPerSmp']}
      ></scl-select>
      <scl-text-field
        class="smvcontrol attribute"
        label="smpRate"
        .value=${smpRate}
        supportingText="Sample Rate (Based on Sample Mode)"
        required
        type="number"
        @input="${this.onSampledValueControlInputChange}"
      ></scl-text-field>
      <scl-text-field
        class="smvcontrol attribute"
        label="nofASDU"
        .value=${nofASDU}
        supportingText="Number of Samples per Ethernet packet"
        required
        type="number"
        min="0"
        @input="${this.onSampledValueControlInputChange}"
      ></scl-text-field>
      <scl-select
        class="smvcontrol attribute"
        label="securityEnabled"
        .value=${securityEnabled}
        nullable
        required
        supportingText="Sampled Value Security Setting"
        @input="${this.onSampledValueControlInputChange}"
        .selectOptions=${['None', 'Signature', 'SignatureAndEncryption']}
      ></scl-select
      ><mwc-button
        class="smvcontrol save"
        label="save"
        icon="save"
        ?disabled=${!this.sampledValueControlDiff}
        @click="${this.saveSampledValueControlChanges}"
      ></mwc-button>
    </div>`;
  }

  render(): TemplateResult {
    if (!this.element)
      return html`<h2 style="display: flex;">
        No SampledValueControl selected
      </h2>`;

    return html`<h2 style="display: flex;">
        <div style="flex:auto">
          <div>SampledValueControl</div>
          <div class="headersubtitle">${identity(this.element)}</div>
        </div>
      </h2>
      <div class="parentcontent">
        ${this.renderSmvControlContent()}${this.renderOtherElements()}
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

    .save {
      align-self: flex-end;
    }

    .content > * {
      display: block;
      margin: 4px 8px 16px;
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
      .content {
        border-left: 0px solid var(--mdc-theme-on-primary);
      }
    }
  `;
}
