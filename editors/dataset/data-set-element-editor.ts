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
import '@material/mwc-dialog';
import type { Button } from '@material/mwc-button';
import type { Dialog } from '@material/mwc-dialog';

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
import '@openenergytools/filterable-lists/dist/action-list.js';
// eslint-disable-next-line import/no-duplicates
import '@openenergytools/scl-text-field';
import type {
  ActionItem,
  ActionList,
} from '@openenergytools/filterable-lists/dist/action-list.js';
// eslint-disable-next-line import/no-duplicates
import { SclTextField } from '@openenergytools/scl-text-field';

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

  @queryAll('scl-text-field') inputs!: SclTextField[];

  @query('mwc-button.save') saveButton!: Button;

  @query('.list.fcda') fcdaList!: ActionList;

  @query('#dapickerbutton') daPickerButton!: Button;

  @query('#dapicker') daPickerDialog!: Dialog;

  @query('#dapicker > oscd-tree-grid') daPicker!: TreeGrid;

  @query('#dopickerbutton') doPickerButton!: Button;

  @query('#dopicker') doPickerDialog!: Dialog;

  @query('#dopicker > oscd-tree-grid') doPicker!: TreeGrid;

  private resetInputs(): void {
    for (const input of this.inputs)
      if (input instanceof SclTextField) input.reset();
  }

  private onInputChange(): void {
    this.someDiffOnInputs = Array.from(this.inputs ?? []).some(
      input => this.element?.getAttribute(input.label) !== input.value
    );
  }

  private saveChanges(): void {
    if (!this.element) return;

    const attributes: Record<string, string | null> = {};
    for (const input of this.inputs ?? [])
      if (this.element.getAttribute(input.label) !== input.value)
        attributes[input.label] = input.value;

    this.dispatchEvent(
      newEditEvent(updateDataSet({ element: this.element, attributes }))
    );

    this.resetInputs();

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

  private renderFCDAList(): TemplateResult {
    const items: ActionItem[] = Array.from(
      this.element!.querySelectorAll('FCDA')
    ).map((fcda, i, arr) => {
      const [ldInst, prefix, lnClass, lnInst, doName, daName, fc] = [
        'ldInst',
        'prefix',
        'lnClass',
        'lnInst',
        'doName',
        'daName',
        'fc',
      ].map(attributeName => fcda.getAttribute(attributeName) ?? '');

      const actions = [
        {
          icon: 'delete',
          label: '',
          callback: () => {
            this.dispatchEvent(newEditEvent(removeFCDA({ node: fcda })));
          },
        },
      ];

      if (i > 0)
        actions.push({
          icon: 'text_select_move_up',
          label: 'move up',
          callback: () => {
            this.onMoveFCDAUp(fcda);
          },
        });
      if (arr.length !== i + 1)
        actions.push({
          icon: 'text_select_move_down',
          label: 'move down',
          callback: () => {
            this.onMoveFCDADown(fcda);
          },
        });

      return {
        headline: `${doName}${daName ? `.${daName} [${fc}]` : ` [${fc}]`}`,
        supportingText: `${ldInst}/${prefix}${lnClass}${lnInst}`,
        actions,
      };
    });

    return html`<action-list
      class="list fcda"
      .items=${items}
      filterable
      searchhelper="Filter Data"
    ></action-list>`;
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
    return html`<scl-text-field
        id="${identity(this.element)}"
        tag="${this.element?.tagName ?? ''}"
        label="name"
        .value=${this.name}
        supportingText="DataSet name"
        required
        @input=${() => this.onInputChange()}
      >
      </scl-text-field>
      <scl-text-field
        id="${identity(this.element)}"
        label="desc"
        .value=${this.desc}
        supportingText="DateSet Description"
        nullable
        @input=${() => this.onInputChange()}
      >
      </scl-text-field>
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

    action-list {
      z-index: 0;
    }

    *[iconTrailing='search'] {
      --mdc-shape-small: 28px;
    }

    ::slotted(mwc-icon-button[disabled]) {
      display: none;
    }
  `;
}
