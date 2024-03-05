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
import '@material/mwc-formfield';
import '@material/mwc-checkbox';
import type { Button } from '@material/mwc-button';
import type { Checkbox } from '@material/mwc-checkbox';

import { newEditEvent } from '@openscd/open-scd-core';
import {
  changeGSEContent,
  ChangeGSEContentOptions,
  controlBlockGseOrSmv,
  identity,
  updateGSEControl,
} from '@openenergytools/scl-lib';

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
import { checkGSEDiff } from '../../foundation/utils/gse.js';

function pElementContent(gse: Element, type: string): string | null {
  return (
    Array.from(gse.querySelectorAll(':scope > Address > P'))
      .find(p => p.getAttribute('type') === type)
      ?.textContent?.trim() ?? null
  );
}

const gseHelpers: Record<string, string> = {
  'MAC-Address': 'MAC address (01-0C-CD-01-xx-xx)',
  APPID: 'APP ID (4 hex values)',
  'VLAN-ID': 'VLAN ID (3 hex value)',
  'VLAN-PRIORITY': 'VLAN Priority (0-7)',
};

const gsePlaceholders: Record<string, string> = {
  'MAC-Address': '01-0C-CD-01-xx-xx',
  APPID: '0000',
  'VLAN-ID': '000',
  'VLAN-PRIORITY': '4',
};

@customElement('gse-control-element-editor')
export class GseControlElementEditor extends LitElement {
  /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  element: Element | null = null;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = -1;

  @property({ attribute: false })
  get gSE(): Element | null {
    return controlBlockGseOrSmv(this.element!);
  }

  @state() private gSEdiff = false;

  @state() private gSEControlDiff = false;

  @queryAll('.content.gse > scl-text-field') gSEInputs?: SclTextField[];

  @query('.content.gse > .save') gseSave!: Button;

  @queryAll('.input.gsecontrol') gSEControlInputs!: (
    | SclTextField
    | SclSelect
    | SclCheckbox
  )[];

  @query('.content.gsecontrol > .save') gseControlSave!: Button;

  @query('#instType') instType?: Checkbox;

  private resetInputs(): void {
    for (const input of this.gSEControlInputs)
      if (input instanceof SclTextField) input.reset();
  }

  private onGSEControlInputChange(): void {
    if (
      Array.from(this.gSEControlInputs ?? []).some(
        input => !input.reportValidity()
      )
    ) {
      this.gSEControlDiff = false;
      return;
    }

    const gSEControlAttrs: Record<string, string | null> = {};
    for (const input of this.gSEControlInputs ?? [])
      gSEControlAttrs[input.label] = input.value;

    this.gSEControlDiff = Array.from(this.gSEControlInputs ?? []).some(
      input => this.element?.getAttribute(input.label) !== input.value
    );
  }

  private saveGSEControlChanges(): void {
    if (!this.element) return;

    const gSEControlAttrs: Record<string, string | null> = {};
    for (const input of this.gSEControlInputs ?? [])
      if (this.element?.getAttribute(input.label) !== input.value)
        gSEControlAttrs[input.label] = input.value;

    this.dispatchEvent(
      newEditEvent(
        updateGSEControl({
          element: this.element,
          attributes: gSEControlAttrs,
        })
      )
    );

    this.resetInputs();

    this.onGSEControlInputChange();
  }

  private onGSEInputChange(): void {
    if (
      Array.from(this.gSEInputs ?? []).some(input => !input.reportValidity())
    ) {
      this.gSEdiff = false;
      return;
    }

    const gSEAttrs: Record<string, string | null> = {};
    for (const input of this.gSEInputs ?? [])
      gSEAttrs[input.label] = input.value;

    this.gSEdiff = checkGSEDiff(this.gSE!, gSEAttrs, this.instType?.checked);
  }

  private saveGSEChanges(): void {
    if (!this.gSE) return;

    const options: ChangeGSEContentOptions = { address: {}, timing: {} };
    for (const input of this.gSEInputs ?? []) {
      if (input.label === 'MAC-Address' && input.value)
        options.address!.mac = input.value;
      if (input.label === 'APPID' && input.value)
        options.address!.appId = input.value;
      if (input.label === 'VLAN-ID' && input.value)
        options.address!.vlanId = input.value;
      if (input.label === 'VLAN-PRIORITY' && input.value)
        options.address!.vlanPriority = input.value;
      if (input.label === 'MinTime' && input.value)
        options.timing!.MinTime = input.value;
      if (input.label === 'MaxTime' && input.value)
        options.timing!.MaxTime = input.value;
    }

    if (this.instType?.checked === true) options.address!.instType = true;
    else if (this.instType?.checked === false)
      options.address!.instType = false;

    this.dispatchEvent(newEditEvent(changeGSEContent(this.gSE, options)));

    this.onGSEInputChange();
  }

  private renderGseContent(): TemplateResult {
    const { gSE } = this;
    if (!gSE)
      return html`<div class="content">
        <h3>
          <div>Communication Settings (GSE)</div>
          <div class="headersubtitle">No connection to SubNetwork</div>
        </h3>
      </div>`;

    const minTime = gSE.querySelector('MinTime')?.innerHTML.trim() ?? null;
    const maxTime = gSE.querySelector('MaxTime')?.innerHTML.trim() ?? null;

    const hasInstType = Array.from(gSE.querySelectorAll('Address > P')).some(
      pType => pType.getAttribute('xsi:type')
    );

    const attributes: Record<string, string | null> = {};
    ['MAC-Address', 'APPID', 'VLAN-ID', 'VLAN-PRIORITY'].forEach(key => {
      if (!attributes[key]) attributes[key] = pElementContent(gSE, key);
    });

    return html`<div class="content gse">
      <h3>Communication Settings (GSE)</h3>
      <mwc-formfield label="Add XMLSchema-instance type"
        ><mwc-checkbox
          id="instType"
          ?checked="${hasInstType}"
          @change=${this.onGSEInputChange}
        ></mwc-checkbox></mwc-formfield
      >${Object.entries(attributes).map(
        ([key, value]) =>
          html`<scl-text-field
            label="${key}"
            ?nullable=${typeNullable[key]}
            .value=${value}
            pattern="${typePattern[key]!}"
            required
            supportingText="${gseHelpers[key]}"
            placeholder="${gsePlaceholders[key]}"
            @input=${this.onGSEInputChange}
          ></scl-text-field>`
      )}<scl-text-field
        label="MinTime"
        .value=${minTime}
        nullable
        supportingText="Min repetition interval"
        suffixText="ms"
        type="number"
        @input=${this.onGSEInputChange}
      ></scl-text-field
      ><scl-text-field
        label="MaxTime"
        .value=${maxTime}
        nullable
        supportingText="Max repetition interval"
        suffixText="ms"
        type="number"
        @input=${this.onGSEInputChange}
      ></scl-text-field>
      <mwc-button
        class="save"
        label="save"
        icon="save"
        ?disabled=${!this.gSEdiff}
        @click=${() => this.saveGSEChanges()}
      ></mwc-button>
    </div>`;
  }

  private renderGseControlContent(): TemplateResult {
    const [name, desc, type, appID, fixedOffs, securityEnabled] = [
      'name',
      'desc',
      'type',
      'appID',
      'fixedOffs',
      'securityEnabled',
    ].map(attr => this.element!.getAttribute(attr));

    /*
    const reservedGseControlNames = Array.from(
      this.element!.parentElement?.querySelectorAll('GSEControl') ?? []
    )
      .map(gseControl => gseControl.getAttribute('name')!)
      .filter(
        gseControlName => gseControlName !== this.element!.getAttribute('name')
      ); */

    return html`<div class="content gsecontrol">
      <scl-text-field
        class="input gsecontrol"
        label="name"
        .value=${name}
        supportingText="GSEControl Name"
        required
        pattern="${patterns.asciName}"
        maxLength="${maxLength.cbName}"
        mimLength="0"
        dialogInitialFocus
        @input=${this.onGSEControlInputChange}
      ></scl-text-field>
      <scl-text-field
        class="input gsecontrol"
        label="desc"
        .value=${desc}
        nullable
        supportingText="GSEControl Description"
        @input=${this.onGSEControlInputChange}
      ></scl-text-field>
      <scl-select
        class="input gsecontrol"
        label="type"
        .value=${type}
        supportingText="GOOSE or GSSE"
        nullable
        required
        .selectOptions=${['GOOSE', 'GSSE']}
        @input=${this.onGSEControlInputChange}
      ></scl-select>
      <scl-text-field
        class="input gsecontrol"
        label="appID"
        .value=${appID}
        supportingText="GSEControl ID"
        required
        @input=${this.onGSEControlInputChange}
      ></scl-text-field>
      <scl-checkbox
        class="input gsecontrol"
        label="fixedOffs"
        .value=${fixedOffs}
        nullable
        supportingText="Whether ASN.1 coding is done with fixed offsets"
        @input=${this.onGSEControlInputChange}
      ></scl-checkbox>
      <scl-select
        class="input gsecontrol"
        label="securityEnabled"
        .value=${securityEnabled}
        nullable
        required
        helper="GSEControl Security Settings"
        @input=${this.onGSEControlInputChange}
        .selectOptions=${['None', 'Signature', 'SignatureAndEncryption']}
      ></scl-select>
      <mwc-button
        class="save"
        label="save"
        icon="save"
        ?disabled=${!this.gSEControlDiff}
        @click=${() => this.saveGSEControlChanges()}
      ></mwc-button>
    </div>`;
  }

  render(): TemplateResult {
    if (!this.element)
      return html`<h2 style="display: flex;">No GSEControl selected</h2>`;

    return html`<h2 style="display: flex;">
        <div style="flex:auto">
          <div>GSEControl</div>
          <div class="headersubtitle">${identity(this.element)}</div>
        </div>
      </h2>
      <div class="parentcontent">
        ${this.renderGseControlContent()}${this.renderGseContent()}
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
      .content {
        border-left: 0px solid var(--mdc-theme-on-primary);
      }
    }
  `;
}
