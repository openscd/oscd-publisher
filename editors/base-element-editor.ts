/* eslint-disable import/no-extraneous-dependencies */
import { LitElement, TemplateResult, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { MdDialog } from '@scopedelement/material-web/dialog/MdDialog.js';
import type { MdIconButton } from '@scopedelement/material-web/iconbutton/MdIconButton.js';

import { newEditEvent } from '@openenergytools/open-scd-core';
import {
  createDataSet,
  findControlBlockSubscription,
  identity,
} from '@openenergytools/scl-lib';
import '@openenergytools/filterable-lists/dist/action-list.js';
import {
  isFCDACompatibleWithIED,
  queryLDevice,
  queryLN,
} from '../foundation/utils/xml.js';

// eslint-disable-next-line no-shadow
export enum ControlBlockCopyStatus {
  CanCopy = 'CanCopy',
  IEDStructureIncompatible = 'IEDStructureIncompatible',
  ControlBlockOrDataSetAlreadyExists = 'ControlBlockOrDataSetAlreadyExists',
}

export interface ControlBlockCopyOption {
  ied: Element;
  control: Element;
  status: ControlBlockCopyStatus;
  selected: boolean;
}

export class BaseElementEditor extends ScopedElementsMixin(LitElement) {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = -1;

  @state()
  selectCtrlBlock?: Element;

  @state()
  selectedDataSet?: Element | null;

  @state()
  controlBlockCopyOptions: ControlBlockCopyOption[] = [];

  @query('.dialog.select') selectDataSetDialog!: MdDialog;

  @query('.dialog.copy') copyControlBlockDialog!: MdDialog;

  @query('.new.dataset') newDataSet!: MdIconButton;

  @query('.change.dataset') changeDataSet!: MdIconButton;

  protected selectDataSet(dataSet: Element): void {
    const name = dataSet.getAttribute('name');
    if (!name || !this.selectCtrlBlock) return;

    this.dispatchEvent(
      newEditEvent(
        {
          element: this.selectCtrlBlock,
          attributes: { datSet: name },
        },
        { title: `Change Data Set of ${identity(this.selectCtrlBlock)}` }
      )
    );
    this.selectedDataSet = dataSet;

    this.selectDataSetDialog.close();
  }

  protected queryIEDs(): Element[] {
    return Array.from(this.doc.querySelectorAll(':root > IED'));
  }

  // eslint-disable-next-line class-methods-use-this
  protected queryLnForControl(ied: Element, control: Element): Element | null {
    const lDevice = control.closest('LDevice');
    const lnOrLn0 = control.closest('LN0, LN');

    if (!lnOrLn0 || !lDevice) {
      throw new Error('ControlBlock must be a child of LN or LN0 and LDevice');
    }

    const ldInst = lDevice.getAttribute('inst') ?? '';
    const lDeviceInIed = queryLDevice(ied, ldInst);

    if (!lDeviceInIed) {
      return null;
    }

    const lnClass = lnOrLn0.getAttribute('lnClass') ?? '';
    const inst = lnOrLn0.getAttribute('inst') ?? '';
    const prefix = lnOrLn0.getAttribute('prefix');

    return queryLN(lDeviceInIed, lnClass, inst, prefix);
  }

  // eslint-disable-next-line class-methods-use-this
  protected getDataSet(control: Element): Element | null {
    return (
      control.parentElement?.querySelector(
        `DataSet[name="${control.getAttribute('datSet')}"]`
      ) ?? null
    );
  }

  // eslint-disable-next-line class-methods-use-this
  protected getCopyControlBlockCopyStatus(
    controlBlock: Element,
    otherIED: Element
  ): ControlBlockCopyStatus {
    const ln = this.queryLnForControl(otherIED, controlBlock);

    if (!ln) {
      return ControlBlockCopyStatus.IEDStructureIncompatible;
    }

    const controlInOtherIED = ln.querySelector(
      `${controlBlock.tagName}[name="${controlBlock.getAttribute('name')}"]`
    );
    const hasControl = Boolean(controlInOtherIED);

    const dataSet = this.getDataSet(controlBlock);

    if (!dataSet) {
      throw new Error('ControlBlock has no DataSet');
    }

    const hasDataSet =
      dataSet !== null &&
      Boolean(
        ln.querySelector(`DataSet[name="${dataSet?.getAttribute('name')}"]`)
      );

    if (hasDataSet || hasControl) {
      return ControlBlockCopyStatus.ControlBlockOrDataSetAlreadyExists;
    }

    const fcdas = Array.from(dataSet.querySelectorAll('FCDA'));
    for (const fcda of fcdas) {
      const isCompatible = isFCDACompatibleWithIED(fcda, otherIED);

      if (!isCompatible) {
        // console.log(`FCDA is not compatible`, fcda);
        return ControlBlockCopyStatus.IEDStructureIncompatible;
      }
    }

    return ControlBlockCopyStatus.CanCopy;
  }

  protected copyControlBlock(): void {
    const selectedOptions = this.controlBlockCopyOptions.filter(
      o => o.selected
    );

    if (selectedOptions.length === 0) {
      this.copyControlBlockDialog.close();
      return;
    }

    const inserts = selectedOptions.flatMap(o => {
      const ln = this.queryLnForControl(o.ied, o.control);
      const dataSet = this.getDataSet(o.control);

      if (!ln || !dataSet) {
        throw new Error('ControlBlock or DataSet not found');
      }

      const controlCopy = o.control.cloneNode(true) as Element;
      const controlInsert = {
        parent: ln,
        node: controlCopy,
        reference: null,
      };

      const dataSetCcopy = dataSet.cloneNode(true) as Element;
      const dataSetInsert = {
        parent: ln,
        node: dataSetCcopy,
        reference: null,
      };

      return [controlInsert, dataSetInsert];
    });

    this.dispatchEvent(
      newEditEvent(inserts, {
        title: `Copy control block to ${selectedOptions.length} IEDs`,
      })
    );

    this.copyControlBlockDialog.close();
  }

  private addNewDataSet(control: Element): void {
    const parent = control.parentElement;
    if (!parent) return;

    const insert = createDataSet(parent);
    if (!insert) return;

    const newName = (insert.node as Element).getAttribute('name');
    if (!newName) return;

    const update = { element: control, attributes: { datSet: newName } };

    this.dispatchEvent(
      newEditEvent([insert, update], { title: 'Add New Data Set' })
    );

    this.selectedDataSet = this.selectCtrlBlock?.parentElement?.querySelector(
      `:scope > DataSet[name="${this.selectCtrlBlock.getAttribute('datSet')}"]`
    );
  }

  private showSelectDataSetDialog(): void {
    this.selectDataSetDialog.show();
  }

  protected renderSelectDataSetDialog(): TemplateResult {
    const items = Array.from(
      this.selectCtrlBlock?.parentElement?.querySelectorAll(
        ':scope > DataSet'
      ) ?? []
    ).map(dataSet => ({
      headline: `${dataSet.getAttribute('name')}`,
      supportingText: `${identity(dataSet)}`,
      primaryAction: () => {
        this.selectDataSet(dataSet);
      },
    }));

    return html`<md-dialog class="dialog select">
      <action-list slot="content" .items=${items} filterable></action-list>
    </md-dialog>`;
  }

  protected renderCopyControlBlockDialog(): TemplateResult {
    return html`<md-dialog
      class="dialog copy"
      @close=${() => {
        this.controlBlockCopyOptions = [];
      }}
    >
      <div slot="content" class="copy-option-list">
        ${this.controlBlockCopyOptions.map(
          option =>
            html`<label>
              ${option.ied.getAttribute('name')}
              <md-checkbox
                ?checked=${option.selected}
                @change=${() => {
                  // eslint-disable-next-line no-param-reassign
                  option.selected = !option.selected;
                }}
                ?disabled=${option.status !== ControlBlockCopyStatus.CanCopy}
              >
              </md-checkbox>
              <div>${option.status}</div>
            </label>`
        )}
        <div>
          <md-outlined-button @click=${this.copyControlBlock}
            >Copy 2</md-outlined-button
          >
        </div>
      </div>
    </md-dialog>`;
  }

  protected renderDataSetElementContainer(): TemplateResult {
    return html`
      <div class="content dataSet">
        ${this.renderSelectDataSetDialog()}
        <data-set-element-editor
          .element=${this.selectedDataSet!}
          .showHeader=${false}
          editCount="${this.editCount}"
        >
          <md-icon-button
            class="change dataset"
            slot="change"
            ?disabled=${!!findControlBlockSubscription(this.selectCtrlBlock!)
              .length}
            @click=${this.showSelectDataSetDialog}
            ><md-icon>swap_vert</md-icon></md-icon-button
          >
          <md-icon-button
            class="new dataset"
            slot="new"
            ?disabled=${!!this.selectCtrlBlock!.getAttribute('datSet')}
            @click="${() => {
              this.addNewDataSet(this.selectCtrlBlock!);
            }}"
            ><md-icon>playlist_add</md-icon></md-icon-button
          ></data-set-element-editor
        >
      </div>
    `;
  }
}
