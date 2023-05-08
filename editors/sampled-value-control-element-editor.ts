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

import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import type { Checkbox } from '@material/mwc-checkbox';

import '../foundation/components/oscd-checkbox.js';
import '../foundation/components/oscd-select.js';
import '../foundation/components/oscd-textfield.js';
import type { OscdTextfield } from '../foundation/components/oscd-textfield.js';
import type { OscdCheckbox } from '../foundation/components/oscd-checkbox.js';

import {
  maxLength,
  patterns,
  typeNullable,
  typePattern,
} from '../foundation/pattern.js';
import { identity } from '../foundation/identities/identity.js';

import { checkSMVDiff, updateSmvAddress } from '../foundation/utils/smv.js';
import { updateSmvOpts } from '../foundation/utils/sampledvaluecontrol.js';

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
  editCount = 0;

  @property({ attribute: false })
  get sMV(): Element | null {
    const cbName = this.element.getAttribute('name');
    const iedName = this.element.closest('IED')?.getAttribute('name');
    const apName = this.element.closest('AccessPoint')?.getAttribute('name');
    const ldInst = this.element.closest('LDevice')?.getAttribute('inst');

    return this.element.ownerDocument.querySelector(
      `:root > Communication > SubNetwork > ` +
        `ConnectedAP[iedName="${iedName}"][apName="${apName}"] > ` +
        `SMV[ldInst="${ldInst}"][cbName="${cbName}"]`
    );
  }

  @state()
  private sMVdiff = false;

  @state()
  private smvOptsDiff = false;

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

    const pTypes: Record<string, string | null> = {};
    for (const input of this.sMVInputs ?? [])
      pTypes[input.label] = input.maybeValue;

    this.dispatchEvent(
      newEditEvent(
        updateSmvAddress(this.sMV, {
          pTypes,
          instType: this.instType?.checked,
        })
      )
    );

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

    this.dispatchEvent(newEditEvent(updateSmvOpts(smvOpts, smvOptsAttrs)));

    this.onSmvOptsInputChange();
  }

  @queryAll('.content.smv > oscd-textfield') sMVInputs?: OscdTextfield[];

  @queryAll('.content.smvopts > oscd-checkbox')
  smvOptsInputs?: OscdCheckbox[];

  @query('#instType') instType?: Checkbox;

  private renderSmvContent(): TemplateResult {
    const { sMV } = this;
    if (!sMV)
      return html` <h3>
        <div>'publisher.smv.commsetting</div>
        <div class="headersubtitle">publisher.smv.noconnectionap'</div>
      </h3>`;

    const hasInstType = Array.from(sMV.querySelectorAll('Address > P')).some(
      pType => pType.getAttribute('xsi:type')
    );

    const attributes: Record<string, string | null> = {};

    ['MAC-Address', 'APPID', 'VLAN-ID', 'VLAN-PRIORITY'].forEach(key => {
      if (!attributes[key])
        attributes[key] =
          sMV
            .querySelector(`Address > P[type="${key}"]`)
            ?.textContent?.trim() ?? null;
    });

    return html` <div class="content smv">
      <h3>Communication Settings (SMV)</h3>
      <mwc-formfield label="connectedap.wizard.addschemainsttype"
        ><mwc-checkbox
          id="instType"
          ?checked="${hasInstType}"
          @change=${this.onSMVInputChange}
        ></mwc-checkbox></mwc-formfield
      >${Object.entries(attributes).map(
        ([key, value]) =>
          html`<oscd-textfield
            label="${key}"
            ?nullable=${typeNullable[key]}
            .maybeValue=${value}
            pattern="${typePattern[key]!}"
            required
            @input=${this.onSMVInputChange}
          ></oscd-textfield>`
      )}<mwc-button
        class="save"
        label="save"
        icon="save"
        ?disabled=${!this.sMVdiff}
        @click=${() => this.saveSMVChanges()}
      ></mwc-button>
    </div>`;
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
      <h3>'Sampled Value Options'</h3>
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
            helper="scl.key"
            @input=${this.onSmvOptsInputChange}
          ></oscd-checkbox>`
      )}<mwc-button
        class="save"
        label="save"
        icon="save"
        ?disabled=${!this.smvOptsDiff}
        @click=${() => this.saveSmvOptsChanges()}
      ></mwc-button>
    </div>`;
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

    return html`<div class="content">
      <oscd-textfield
        label="name"
        .maybeValue=${name}
        helper="scl.name"
        required
        validationMessage="textfield.required')}"
        pattern="${patterns.asciName}"
        maxLength="${maxLength.cbName}"
        dialogInitialFocus
        disabled
      ></oscd-textfield>
      <oscd-textfield
        label="desc"
        .maybeValue=${desc}
        nullable
        helper="scl.desc')}"
        disabled
      ></oscd-textfield>
      ${multicast === 'true'
        ? html``
        : html`<oscd-checkbox
            label="multicast"
            .maybeValue=${multicast}
            helper="scl.multicast')}"
            disabled
          ></oscd-checkbox>`}
      <oscd-textfield
        label="smvID"
        .maybeValue=${smvID}
        helper="scl.id')}"
        required
        voscd-textfield="textfield.nonempty')}"
        disabled
      ></oscd-textfield>
      <oscd-select
        label="smpMod"
        .maybeValue=${smpMod}
        nullable
        required
        helper="scl.smpMod')}"
        disabled
        >${['SmpPerPeriod', 'SmpPerSec', 'SecPerSmp'].map(
          option =>
            html`<mwc-list-item value="${option}">${option}</mwc-list-item>`
        )}</oscd-select
      >
      <oscd-textfield
        label="smpRate"
        .maybeValue=${smpRate}
        helper="scl.smpRate')}"
        required
        type="number"
        moscd-textfield
        oscd-textfield
      ></oscd-textfield>
      <oscd-textfield
        label="nofASDU"
        .maybeValue=${nofASDU}
        helper="scl.nofASDU')}"
        required
        type="number"
        min="0"
        disabled
      ></oscd-textfield>
      <oscd-select
        label="securityEnabled"
        .maybeValue=${securityEnabled}
        nullable
        required
        helper="scl.securityEnable')}"
        disabled
        >${['None', 'Signature', 'SignatureAndEncryption'].map(
          type => html`<mwc-list-item value="${type}">${type}</mwc-list-item>`
        )}</oscd-select
      >
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
      border-left: thick solid var(--mdc-theme-on-primary);
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
