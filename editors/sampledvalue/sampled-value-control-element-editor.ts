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
  updateSampledValueControl,
} from '@openenergytools/scl-lib';

import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import type { Checkbox } from '@material/mwc-checkbox';

import '../../foundation/components/oscd-checkbox.js';
import '../../foundation/components/oscd-select.js';
import '../../foundation/components/scl-textfield.js';
import type { OscdCheckbox } from '../../foundation/components/oscd-checkbox.js';
import type { OscdSelect } from '../../foundation/components/oscd-select.js';
import type { SclTextfield } from '../../foundation/components/scl-textfield.js';

import {
  maxLength,
  patterns,
  typeNullable,
  typePattern,
} from '../../foundation/pattern.js';
import { identity } from '../../foundation/identities/identity.js';

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

@customElement('sampled-value-control-element-editor')
export class SampledValueControlElementEditor extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  element!: Element;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = -1;

  @property({ attribute: false })
  get sMV(): Element | null {
    const cbName = this.element.getAttribute('name');
    const iedName = this.element.closest('IED')?.getAttribute('name');
    const apName = this.element.closest('AccessPoint')?.getAttribute('name');
    const ldInst = this.element.closest('LDevice')?.getAttribute('inst');

    return this.element.ownerDocument.querySelector(
      `:root > Communication > SubNetwork 
      > ConnectedAP[iedName="${iedName}"][apName="${apName}"] 
      > SMV[ldInst="${ldInst}"][cbName="${cbName}"]`
    );
  }

  @state()
  private sMVdiff = false;

  @state()
  private smvOptsDiff = false;

  @state()
  private sampledValueControlDiff = false;

  private onSampledValueControlInputChange(): void {
    if (
      Array.from(this.sampledValueControlInputs ?? []).some(
        input => !input.checkValidity()
      )
    ) {
      this.sampledValueControlDiff = false;
      return;
    }

    const sampledValueControlAttrs: Record<string, string | null> = {};
    for (const input of this.sampledValueControlInputs ?? [])
      sampledValueControlAttrs[input.label] = input.maybeValue;

    this.sampledValueControlDiff = Array.from(
      this.sampledValueControlInputs ?? []
    ).some(
      input => this.element?.getAttribute(input.label) !== input.maybeValue
    );
  }

  private saveSampledValueControlChanges(): void {
    if (!this.element) return;

    const sampledValueControlAttrs: Record<string, string | null> = {};
    for (const input of this.sampledValueControlInputs ?? [])
      if (this.element?.getAttribute(input.label) !== input.maybeValue)
        sampledValueControlAttrs[input.label] = input.maybeValue;

    this.dispatchEvent(
      newEditEvent(
        updateSampledValueControl({
          element: this.element,
          attributes: sampledValueControlAttrs,
        })
      )
    );

    this.onSampledValueControlInputChange();
  }

  private onSMVInputChange(): void {
    if (
      Array.from(this.sMVInputs ?? []).some(input => !input.checkValidity())
    ) {
      this.sMVdiff = false;
      return;
    }

    const pTypes: Record<string, string | null> = {};
    for (const input of this.sMVInputs ?? [])
      pTypes[input.label] = input.maybeValue;

    this.sMVdiff = checkSMVDiff(this.sMV!, {
      pTypes,
      instType: this.instType?.checked,
    });
  }

  private saveSMVChanges(): void {
    if (!this.sMV) return;

    const options: ChangeGseOrSmvAddressOptions = {};
    for (const input of this.sMVInputs ?? []) {
      if (input.label === 'MAC-Address' && input.maybeValue)
        options.mac = input.maybeValue;
      if (input.label === 'APPID' && input.maybeValue)
        options.appId = input.maybeValue;
      if (input.label === 'VLAN-ID' && input.maybeValue)
        options.vlanId = input.maybeValue;
      if (input.label === 'VLAN-PRIORITY' && input.maybeValue)
        options.vlanPriority = input.maybeValue;
    }

    if (this.instType?.checked === true) options.instType = true;
    else if (this.instType?.checked === false) options.instType = false;

    this.dispatchEvent(newEditEvent(changeSMVContent(this.sMV, options)));

    this.onSMVInputChange();
  }

  private onSmvOptsInputChange(): void {
    const smvOpts = this.element.querySelector(':scope > SmvOpts');

    if (
      Array.from(this.smvOptsInputs ?? []).some(input => !input.checkValidity())
    ) {
      this.smvOptsDiff = false;
      return;
    }

    const smvOptsAttrs: Record<string, string | null> = {};
    for (const input of this.smvOptsInputs ?? [])
      smvOptsAttrs[input.label] = input.maybeValue;

    this.smvOptsDiff = Array.from(this.smvOptsInputs ?? []).some(
      input => smvOpts?.getAttribute(input.label) !== input.maybeValue
    );
  }

  private saveSmvOptsChanges(): void {
    const smvOpts = this.element.querySelector(':scope > SmvOpts');

    if (!smvOpts) return;

    const smvOptsAttrs: Record<string, string | null> = {};
    for (const input of this.smvOptsInputs ?? [])
      if (smvOpts.getAttribute(input.label) !== input.maybeValue)
        smvOptsAttrs[input.label] = input.maybeValue;

    const updateEdit = { element: smvOpts, attributes: smvOptsAttrs };
    this.dispatchEvent(newEditEvent(updateEdit));

    this.onSmvOptsInputChange();
  }

  @queryAll(
    '.content.smvcontrol > scl-textfield, .content.smvcontrol > oscd-select, .content.smvcontrol > oscd-checkbox'
  )
  sampledValueControlInputs?: (SclTextfield | OscdSelect | OscdCheckbox)[];

  @queryAll('.content.smv > scl-textfield') sMVInputs?: SclTextfield[];

  @queryAll('.content.smvopts > oscd-checkbox')
  smvOptsInputs?: OscdCheckbox[];

  @query('#instType') instType?: Checkbox;

  private renderSmvContent(): TemplateResult {
    const { sMV } = this;
    if (!sMV)
      return html` <h3>
        <div>'Communication Settings (SMV)</div>
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
            id="instType"
            ?checked="${hasInstType}"
            @change=${this.onSMVInputChange}
          ></mwc-checkbox></mwc-formfield
        >${Object.entries(attributes).map(
          ([key, value]) =>
            html`<scl-textfield
              label="${key}"
              ?nullable=${typeNullable[key]}
              .maybeValue=${value}
              pattern="${typePattern[key]!}"
              required
              helper="${smvHelpers[key]}"
              @input=${this.onSMVInputChange}
            ></scl-textfield>`
        )}
      </div>
      <mwc-button
        class="save"
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
      attr => this.element.querySelector('SmvOpts')?.getAttribute(attr) ?? null
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
            html`<oscd-checkbox
              label="${key}"
              .maybeValue=${value}
              nullable
              helper="${smvOptsHelpers[key]}"
              @input=${this.onSmvOptsInputChange}
            ></oscd-checkbox>`
        )}
      </div>
      <mwc-button
        class="save"
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
      multicast,
      smvID,
      smpMod,
      smpRate,
      nofASDU,
      securityEnabled,
    ] = [
      'name',
      'desc',
      'multicast',
      'smvID',
      'smpMod',
      'smpRate',
      'nofASDU',
      'securityEnabled',
    ].map(attr => this.element?.getAttribute(attr));

    return html`<div class="content smvcontrol">
      <scl-textfield
        label="name"
        .maybeValue=${name}
        helper="Sampled Value Name"
        required
        pattern="${patterns.asciName}"
        maxLength="${maxLength.cbName}"
        dialogInitialFocus
        @input="${this.onSampledValueControlInputChange}"
      ></scl-textfield>
      <scl-textfield
        label="desc"
        .maybeValue=${desc}
        nullable
        helper="Sampled Value Description"
        @input="${this.onSampledValueControlInputChange}"
      ></scl-textfield>
      ${multicast === null || multicast === 'true'
        ? html``
        : html`<oscd-checkbox
            label="multicast"
            .maybeValue=${multicast}
            helper="Whether Sample Value Stream is multicast"
            @input="${this.onSampledValueControlInputChange}"
          ></oscd-checkbox>`}
      <scl-textfield
        label="smvID"
        .maybeValue=${smvID}
        helper="Sampled Value ID"
        required
        @input="${this.onSampledValueControlInputChange}"
      ></scl-textfield>
      <oscd-select
        label="smpMod"
        .maybeValue=${smpMod}
        nullable
        required
        helper="Sample mode (Samples per Second, Sampled per Period, Seconds per Sample)"
        @selected="${this.onSampledValueControlInputChange}"
        >${['SmpPerPeriod', 'SmpPerSec', 'SecPerSmp'].map(
          option =>
            html`<mwc-list-item value="${option}">${option}</mwc-list-item>`
        )}</oscd-select
      >
      <scl-textfield
        label="smpRate"
        .maybeValue=${smpRate}
        helper="Sample Rate (Based on Sample Mode)"
        required
        type="number"
        mscl-textfield
        scl-textfield
        @input="${this.onSampledValueControlInputChange}"
      ></scl-textfield>
      <scl-textfield
        label="nofASDU"
        .maybeValue=${nofASDU}
        helper="Number of Samples per Ethernet packet"
        required
        type="number"
        min="0"
        @input="${this.onSampledValueControlInputChange}"
      ></scl-textfield>
      <oscd-select
        label="securityEnabled"
        .maybeValue=${securityEnabled}
        nullable
        required
        helper="Sampled Value Security Setting"
        @selected="${this.onSampledValueControlInputChange}"
        >${['None', 'Signature', 'SignatureAndEncryption'].map(
          type => html`<mwc-list-item value="${type}">${type}</mwc-list-item>`
        )}</oscd-select
      ><mwc-button
        class="save"
        label="save"
        icon="save"
        ?disabled=${!this.sampledValueControlDiff}
        @click="${this.saveSampledValueControlChanges}"
      ></mwc-button>
    </div>`;
  }

  render(): TemplateResult {
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
