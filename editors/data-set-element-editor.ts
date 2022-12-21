/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, queryAll, state } from 'lit/decorators.js';

import '@material/mwc-list/mwc-list-item';

import { newEditEvent } from '@openscd/open-scd-core';

import '../foundation/components/oscd-textfield.js';
import type { OscdTextfield } from '../foundation/components/oscd-textfield.js';

import { identity } from '../foundation/identities/identity.js';
import { updateDateSetName } from '../foundation/utils/dataSet.js';
import { removeFCDA } from '../foundation/utils/fcda.js';

@customElement('data-set-element-editor')
export class DataSetElementEditor extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  element!: Element | null;

  @state()
  private get name(): string | null {
    return this.element ? this.element.getAttribute('name') : 'UNDEFINED';
  }

  @state()
  private get desc(): string | null {
    return this.element ? this.element.getAttribute('desc') : 'UNDEFINED';
  }

  @state()
  private someInputDiff = false;

  private onInputChange(): void {
    this.someInputDiff = Array.from(this.inputs ?? []).some(
      input => this.element?.getAttribute(input.label) !== input.maybeValue
    );
  }

  private saveChanges(): void {
    if (!this.element) return;

    const attributes: Record<string, string | null> = {};
    for (const input of this.inputs ?? [])
      if (this.element.getAttribute(input.label) !== input.maybeValue)
        attributes[input.label] = input.maybeValue;

    this.dispatchEvent(
      newEditEvent(updateDateSetName(this.element, attributes))
    );

    this.onInputChange();
  }

  @queryAll('oscd-textfield') inputs?: OscdTextfield[];

  private renderContent(): TemplateResult {
    return html`<oscd-textfield
        id="${identity(this.element)}"
        tag="${this.element?.tagName ?? ''}"
        label="name"
        .maybeValue=${this.name}
        helper="scl.name"
        required
        @input=${() => this.onInputChange()}
      >
      </oscd-textfield>
      <oscd-textfield
        id="${identity(this.element)}"
        label="desc"
        .maybeValue=${this.desc}
        helper="scl.desc"
        nullable
        @input=${() => this.onInputChange()}
      >
      </oscd-textfield>
      <mwc-button
        class="save"
        label="save"
        icon="save"
        ?disabled=${!this.someInputDiff}
        @click=${() => this.saveChanges()}
      ></mwc-button>
      <oscd-filtered-list
        >${Array.from(this.element!.querySelectorAll('FCDA')).map(fcda => {
          const [ldInst, prefix, lnClass, lnInst, doName, daName, fc] = [
            'ldInst',
            'prefix',
            'lnClass',
            'lnInst',
            'doName',
            'daName',
            'fc',
          ].map(attributeName => fcda.getAttribute(attributeName) ?? '');

          return html`<mwc-list-item hasMeta selected twoline value="${identity(
            fcda
          )}"
            ><span>${doName}${daName ? `.${daName} [${fc}]` : ` [${fc}]`}</span
            ><span slot="secondary"
              >${`${ldInst}/${prefix}${lnClass}${lnInst}`}</span
            ></span>
            <span slot="meta"><mwc-icon-button icon="delete" @click=${() =>
              this.dispatchEvent(
                newEditEvent(removeFCDA(fcda))
              )}></mwc-icon-button>
            </span>
          </mwc-list-item>`;
        })}</oscd-filtered-list
      >`;
  }

  render(): TemplateResult {
    if (this.element)
      return html`<div class="content">
        <h2>
          <div>DataSet</div>
          <div class="headersubtitle">${identity(this.element)}</div>
        </h2>
        ${this.renderContent()}
      </div>`;

    return html`<div class="content">
      <h2>
        <div>DataSet</div>
        <div class="headersubtitle">publisher.nodataset</div>
      </h2>
    </div>`;
  }

  static styles = css`
    .content {
      display: flex;
      flex-direction: column;
      background-color: var(--mdc-theme-surface);
    }

    .content > * {
      display: block;
      margin: 4px 8px 16px;
    }

    .save {
      display: flex;
      align-self: flex-end;
    }

    h2 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;

      margin: 0px;
      padding-left: 0.3em;
      transition: background-color 150ms linear;
    }

    .headersubtitle {
      font-size: 16px;
      font-weight: 200;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    mwc-list-item {
      --mdc-list-item-meta-size: 48px;
    }

    *[iconTrailing='search'] {
      --mdc-shape-small: 28px;
    }
  `;
}
