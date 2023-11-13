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
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-dialog';
import type { Button } from '@material/mwc-button';
import type { Dialog } from '@material/mwc-dialog';
import type { Menu } from '@material/mwc-menu';

import '@openscd/oscd-tree-grid';
import { newEditEvent } from '@openscd/open-scd-core';
import type { TreeGrid } from '@openscd/oscd-tree-grid';
import {
  canAddFCDA,
  find,
  identity,
  maxAttributes,
  removeFCDA,
  updateDataSet,
} from '@openenergytools/scl-lib';

import '../../foundation/components/scl-textfield.js';
import '../../foundation/components/action-filtered-list.js';
import type { SclTextfield } from '../../foundation/components/scl-textfield.js';

import { addFCDAs, addFCDOs } from './foundation.js';
import { dataAttributeTree } from './dataAttributePicker.js';
import { dataObjectTree } from './dataObjectPicker.js';

function dataAttributePaths(doc: XMLDocument, paths: string[][]): Element[][] {
  const daPaths: Element[][] = [];
  for (const path of paths) {
    const daPath: Element[] = [];
    for (const section of path) {
      const [tag, id] = section.split(': ');
      const ancestor = find(doc, tag, id);
      if (ancestor) daPath.push(ancestor);
    }
    daPaths.push(daPath);
  }

  return daPaths;
}

function functionalConstraintPaths(
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
      const ancestor = find(doc, tag, id);
      if (ancestor) doPath.push(ancestor);
    }
    fcPaths.push({ path: doPath, fc });
  }

  return fcPaths;
}

function loadIcon(percent: number): string {
  if (percent < 0.1) return 'circle';
  if (percent < 0.2) return 'clock_loader_10';
  if (percent < 0.4) return 'clock_loader_20';
  if (percent < 0.6) return 'clock_loader_40';
  if (percent < 0.8) return 'clock_loader_60';
  if (percent < 0.9) return 'clock_loader_80';
  if (percent < 1) return 'clock_loader_90';

  return 'stroke_full';
}

@customElement('data-set-element-editor')
export class DataSetElementEditor extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** The element being edited */
  @property({ attribute: false })
  element: Element | null = null;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = -1;

  @state()
  private get name(): string | null {
    return this.element!.getAttribute('name');
  }

  @state()
  private get desc(): string | null {
    return this.element!.getAttribute('desc');
  }

  @state()
  private get fcdaCount(): number {
    return this.element!.querySelectorAll('FCDA').length;
  }

  @state()
  private someDiffOnInputs = false;

  @queryAll('scl-textfield') inputs?: SclTextfield[];

  @query('#dapickerbutton') daPickerButton!: Button;

  @query('#dapicker') daPickerDialog!: Dialog;

  @query('#dapicker > oscd-tree-grid') daPicker!: TreeGrid;

  @query('#dopickerbutton') doPickerButton!: Button;

  @query('#dopicker') doPickerDialog!: Dialog;

  @query('#dopicker > oscd-tree-grid') doPicker!: TreeGrid;

  private onInputChange(): void {
    this.someDiffOnInputs = Array.from(this.inputs ?? []).some(
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
      newEditEvent(updateDataSet({ element: this.element, attributes }))
    );

    this.onInputChange();
  }

  private saveDataObjects(): void {
    const { paths } = this.doPicker;

    const actions = addFCDOs(
      this.element!,
      functionalConstraintPaths(this.element!.ownerDocument, paths)
    );

    this.dispatchEvent(newEditEvent(actions));
    this.doPickerDialog.close();
  }

  private saveDataAttributes(): void {
    const { paths } = this.daPicker;

    const actions = addFCDAs(
      this.element!,
      dataAttributePaths(this.element!.ownerDocument, paths)
    );

    this.dispatchEvent(newEditEvent(actions));
    this.daPickerDialog.close();
  }

  private onMoveFCDAUp(fcda: Element): void {
    const remove = { node: fcda };
    const insert = {
      parent: fcda.parentElement,
      node: fcda,
      reference: fcda.previousElementSibling,
    };

    this.dispatchEvent(newEditEvent([remove, insert]));
  }

  private onMoveFCDADown(fcda: Element): void {
    const remove = { node: fcda };
    const insert = {
      parent: fcda.parentElement,
      node: fcda,
      reference: fcda.nextElementSibling?.nextElementSibling,
    };

    this.dispatchEvent(newEditEvent([remove, insert]));
  }

  updated(): void {
    this.shadowRoot?.querySelectorAll('mwc-menu').forEach(menu => {
      // eslint-disable-next-line no-param-reassign
      (menu as Menu).anchor = menu.previousElementSibling as HTMLElement;
    });
  }

  private renderFCDAList(): TemplateResult {
    return html` <action-filtered-list style="position:relative"
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

        return html`<mwc-list-item selected twoline value="${identity(fcda)}"
            ><span>${doName}${daName ? `.${daName} [${fc}]` : ` [${fc}]`}</span
            ><span slot="secondary"
              >${`${ldInst}/${prefix}${lnClass}${lnInst}`}</span
            ></span>
          </mwc-list-item>
          <mwc-list-item 
            style="height:72px;" 
            slot="primaryAction" 
            @request-selected="${(e: Event) => {
              e.stopPropagation();
              this.dispatchEvent(newEditEvent(removeFCDA({ node: fcda })));
            }}">
            <mwc-icon>delete</mwc-icon>
          </mwc-list-item>
          <div style="position:relative" slot="secondaryAction">
          <mwc-list-item 
            style="height:72px;" 
            slot="secondaryAction"
            @request-selected="${(e: Event) => {
              e.stopPropagation();
              ((e.target as Element).nextElementSibling as Menu).show();
            }}"
          >
            <mwc-icon>more_vert</mwc-icon>
          </mwc-list-item>
          <mwc-menu corner="BOTTOM_LEFT" menuCorner="END">
            <mwc-list-item
              graphic="icon" 
              ?disabled=${!fcda.previousElementSibling} 
              @request-selected="${(evt: Event) => {
                evt.stopPropagation();
                this.onMoveFCDAUp(fcda);
                ((evt.target as Element).parentElement as Menu).close();
              }}"
            >
              <span>move up</span>
              <mwc-icon slot="graphic">text_select_move_up</mwc-icon>
            </mwc-list-item>
            <mwc-list-item 
              graphic="icon" 
              ?disabled=${!fcda.nextElementSibling} 
              @request-selected="${(evt: Event) => {
                evt.stopPropagation();
                this.onMoveFCDADown(fcda);
                ((evt.target as Element).parentElement as Menu).close();
              }}"
            >
              <span>move down</span>
              <mwc-icon slot="graphic">text_select_move_down</mwc-icon>
            </mwc-list-item>
          </mwc-menu>
          </div>
          `;
      })}</action-filtered-list
    >`;
  }

  private renderDataObjectPicker(): TemplateResult {
    const server = this.element?.closest('Server')!;

    return html` <mwc-button
        id="doPickerButton"
        label="Add data object"
        icon="playlist_add"
        ?disabled=${!canAddFCDA(this.element!)}
        @click=${() => this.doPickerDialog?.show()}
      ></mwc-button
      ><mwc-dialog id="dopicker" heading="Add Data Attributes">
        <oscd-tree-grid .tree=${dataObjectTree(server)}></oscd-tree-grid>
        <mwc-button
          slot="secondaryAction"
          label="close"
          @click=${() => this.doPickerDialog?.close()}
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
        id="daPickerButton"
        label="Add data attribute"
        icon="playlist_add"
        ?disabled=${!canAddFCDA(this.element!)}
        @click=${() => this.daPickerDialog.show()}
      ></mwc-button
      ><mwc-dialog id="dapicker" heading="Add Data Attributes"
        ><oscd-tree-grid .tree="${dataAttributeTree(server)}"></oscd-tree-grid>
        <mwc-button
          slot="secondaryAction"
          label="close"
          @click=${() => this.daPickerDialog?.close()}
        ></mwc-button>
        <mwc-button
          slot="primaryAction"
          label="save"
          icon="save"
          @click=${this.saveDataAttributes}
        ></mwc-button>
      </mwc-dialog>`;
  }

  private renderDataPickers(): TemplateResult {
    return html`
      <div style="display: flex; flex-direction:row;align-self: center;">
        ${this.renderDataAttributePicker()} ${this.renderDataObjectPicker()}
      </div>
    `;
  }

  private renderLimits(): TemplateResult {
    if (!this.element) return html``;

    const { max } = maxAttributes(this.element);
    const is = this.fcdaCount;

    return html`<h3
      style="display: flex; flex-direction:row;align-self: center;"
    >
      Entries: <mwc-icon>${loadIcon(is / max)}</mwc-icon> ${is}/${max}
    </h3>`;
  }

  private renderDataSetAttributes(): TemplateResult {
    return html`<scl-textfield
        id="${identity(this.element)}"
        tag="${this.element?.tagName ?? ''}"
        label="name"
        .maybeValue=${this.name}
        helper="DataSet name"
        required
        @input=${() => this.onInputChange()}
      >
      </scl-textfield>
      <scl-textfield
        id="${identity(this.element)}"
        label="desc"
        .maybeValue=${this.desc}
        helper="DateSet Description"
        nullable
        @input=${() => this.onInputChange()}
      >
      </scl-textfield>
      <mwc-button
        class="save"
        label="save"
        icon="save"
        ?disabled=${!this.someDiffOnInputs}
        @click=${() => this.saveChanges()}
      ></mwc-button>
      <hr color="lightgrey" />`;
  }

  private renderHeader(): TemplateResult {
    const subtitle = this.element
      ? identity(this.element)
      : 'No DataSet connected';

    return html`<h2>
      <div style="display:flex; flex-direction:row;">
        <div style="flex:auto;">
          <div>DataSet</div>
          <div class="headersubtitle">${subtitle}</div>
        </div>
        <slot name="change"></slot>
        <slot name="new"></slot>
      </div>
    </h2>`;
  }

  render(): TemplateResult {
    if (this.element)
      return html`<div class="content">
        ${this.renderHeader()}${this.renderDataSetAttributes()}
        ${this.renderLimits()}${this.renderDataPickers()}${this.renderFCDAList()}
      </div>`;

    return html`<div class="content">${this.renderHeader()}</div>`;
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

    h2,
    h3 {
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

    mwc-dialog {
      --mdc-dialog-max-width: 92vw;
    }

    mwc-list-item {
      --mdc-list-item-meta-size: 48px;
    }

    *[iconTrailing='search'] {
      --mdc-shape-small: 28px;
    }

    ::slotted(mwc-icon-button[disabled]) {
      display: none;
    }
  `;
}
