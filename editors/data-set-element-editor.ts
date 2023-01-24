/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement, TemplateResult } from 'lit';
import {
  customElement,
  property,
  query,
  queryAll,
  state,
} from 'lit/decorators.js';

import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-dialog';
import type { Dialog } from '@material/mwc-dialog';

import { newEditEvent } from '@openscd/open-scd-core';

import '../foundation/components/oscd-textfield.js';
import '../foundation/components/oscd-finder-list.js';
import type { OscdTextfield } from '../foundation/components/oscd-textfield.js';
import type { OscdFinderList } from '../foundation/components/oscd-finder-list.js';

import { identity } from '../foundation/identities/identity.js';
import { updateDateSetName } from '../foundation/utils/dataSet.js';
import { addFCDAs, addFCDOs, removeFCDA } from '../foundation/utils/fcda.js';
import {
  getDataAttributeChildren,
  getDataObjectChildren,
  getDisplayString,
  getReader,
} from './foundation.js';
import { selector } from '../foundation/identities/selector.js';

function dataAttributePaths(doc: XMLDocument, paths: string[][]): Element[][] {
  const daPaths: Element[][] = [];
  for (const path of paths) {
    const daPath: Element[] = [];
    for (const section of path) {
      const [tag, id] = section.split(': ');
      const ancestor = doc.querySelector(selector(tag, id));
      if (ancestor) daPath.push(ancestor);
    }
    daPaths.push(daPath);
  }

  return daPaths;
}

function functionaContraintPaths(
  doc: XMLDocument,
  paths: string[][]
): { path: Element[]; fc: string }[] {
  const fcPaths: { path: Element[]; fc: string }[] = [];
  for (const path of paths) {
    const doPath: Element[] = [];
    let fc = '';
    for (const section of path) {
      const [tag, id] = section.split(': ');
      if (tag === 'FC') fc = id;
      const ancestor = doc.querySelector(selector(tag, id));
      if (ancestor) doPath.push(ancestor);
    }
    fcPaths.push({ path: doPath, fc });
  }

  return fcPaths;
}

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

  private saveDataObjects(): void {
    const finder =
      this.dataObjectPicker?.querySelector<OscdFinderList>('oscd-finder-list');
    const paths = finder?.paths ?? [];

    const actions = addFCDOs(
      this.element!,
      functionaContraintPaths(this.element!.ownerDocument, paths)
    );

    this.dispatchEvent(newEditEvent(actions));
    this.dataObjectPicker?.close();
  }

  private saveDataAttributes(): void {
    const finder =
      this.dataAttributePicker?.querySelector<OscdFinderList>(
        'oscd-finder-list'
      );
    const paths = finder?.paths ?? [];

    const actions = addFCDAs(
      this.element!,
      dataAttributePaths(this.element!.ownerDocument, paths)
    );

    this.dispatchEvent(newEditEvent(actions));
    this.dataAttributePicker?.close();
  }

  @queryAll('oscd-textfield') inputs?: OscdTextfield[];

  @query('#dapicker') dataAttributePicker?: Dialog;

  @query('#dopicker') dataObjectPicker?: Dialog;

  // eslint-disable-next-line class-methods-use-this
  private renderHeader(subtitle: string | number): TemplateResult {
    return html`<h2>
      <div style="display:flex; flex-direction:row;">
        <div style="flex:auto;">
          <div>DataSet</div>
          <div class="headersubtitle">${subtitle}</div>
        </div>
        <slot name="change"></slot>
      </div>
    </h2>`;
  }

  private renderDataObjectPicker(): TemplateResult {
    const server = this.element?.closest('Server')!;

    return html` <mwc-button
        label="Add data object"
        icon="playlist_add"
        @click=${() => this.dataObjectPicker?.show()}
      ></mwc-button
      ><mwc-dialog id="dopicker" heading="Add Data Attributes"
        ><oscd-finder-list
          multi
          .paths=${[[`Server: ${identity(server)}`]]}
          .read=${getReader(server.ownerDocument, getDataObjectChildren)}
          .getDisplayString=${getDisplayString}
          .getTitle=${(path: string[]) => path[path.length - 1]}
        ></oscd-finder-list>
        <mwc-button
          slot="secondaryAction"
          label="close"
          @click=${() => this.dataObjectPicker?.close()}
        ></mwc-button>
        <mwc-button
          slot="primaryAction"
          label="save"
          icon="save"
          @click=${this.saveDataObjects}
        ></mwc-button>
      </mwc-dialog>`;
  }

  private renderDataAttributePicker(): TemplateResult {
    const server = this.element?.closest('Server')!;

    return html` <mwc-button
        label="Add data attribute"
        icon="playlist_add"
        @click=${() => this.dataAttributePicker?.show()}
      ></mwc-button
      ><mwc-dialog id="dapicker" heading="Add Data Attributes"
        ><oscd-finder-list
          multi
          .paths=${[[`Server: ${identity(server)}`]]}
          .read=${getReader(server.ownerDocument, getDataAttributeChildren)}
          .getDisplayString=${getDisplayString}
          .getTitle=${(path: string[]) => path[path.length - 1]}
        ></oscd-finder-list>
        <mwc-button
          slot="secondaryAction"
          label="close"
          @click=${() => this.dataAttributePicker?.close()}
        ></mwc-button>
        <mwc-button
          slot="primaryAction"
          label="save"
          icon="save"
          @click=${this.saveDataAttributes}
        ></mwc-button>
      </mwc-dialog>`;
  }

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
      <div style="display: flex; flex-direction:row;align-self: center;">
        ${this.renderDataAttributePicker()} ${this.renderDataObjectPicker()}
      </div>
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
        ${this.renderHeader(identity(this.element))}${this.renderContent()}
      </div>`;

    return html`<div class="content">
      ${this.renderHeader('publisher.nocontent')}
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
