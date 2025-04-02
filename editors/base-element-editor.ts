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
  protected queryLDevice(ied: Element, inst: string): Element | null {
    return ied.querySelector(
      `:scope > AccessPoint > Server > LDevice[inst="${inst}"]`
    );
  }

  // eslint-disable-next-line class-methods-use-this
  protected buildLnQuery(
    lnClass: string,
    inst: string,
    prefix: string | null
  ): string {
    const ln0Query = `:scope > LN0[lnClass="${lnClass}"]`;
    let lnQuery = `:scope > LN[lnClass="${lnClass}"][inst="${inst}"]`;

    if (prefix) {
      lnQuery += `[prefix="${prefix}"]`;
    } else {
      lnQuery += `:not([prefix]), ${lnQuery}[prefix=""]`;
    }

    return `${ln0Query}, ${lnQuery}`;
  }

  // eslint-disable-next-line class-methods-use-this
  protected buildLnQueryForControl(control: Element): string {
    const lDevice = control.closest('LDevice');
    const lnOrLn0 = control.closest('LN0') ?? control.closest('LN');

    if (!lnOrLn0) {
      throw new Error('ControlBlock must be a child of LN or LN0');
    }

    let lnQuery = '';

    if (lnOrLn0.tagName === 'LN0') {
      lnQuery = 'LN0';
    } else {
      const lnClass = lnOrLn0.getAttribute('lnClass');
      // TODO: Handle optional prefix
      const prefix = lnOrLn0.getAttribute('prefix');
      const inst = lnOrLn0.getAttribute('inst');
      lnQuery = `LN[lnClass="${lnClass}"][inst="${inst}"][prefix="${prefix}"]`;
    }

    return `:scope > AccessPoint > Server > LDevice[inst="${lDevice?.getAttribute(
      'inst'
    )}"] > ${lnQuery}`;
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
  protected hasDataType(
    dataTypeTemplates: Element,
    lnType: string,
    doSegments: string[],
    daSegments: string[]
  ): boolean {
    const lNodeType = dataTypeTemplates.querySelector(
      `LNodeType[id="${lnType}"]`
    );
    if (!lNodeType) {
      return false;
    }

    let currentElement = lNodeType;

    for (const doSegement of doSegments) {
      const dataObject = currentElement.querySelector(
        `DO[name="${doSegement}"], SDO[name="${doSegement}"]`
      );
      if (!dataObject) {
        return false;
      }

      // console.log('DO', dataObject);

      const doType = dataObject.getAttribute('type');
      if (!doType) {
        return false;
      }

      const doTypeElement = dataTypeTemplates.querySelector(
        `DOType[id="${doType}"]`
      );
      if (!doTypeElement) {
        return false;
      }

      // console.log('DOType', doTypeElement);

      currentElement = doTypeElement;
    }

    for (const [index, daSegment] of daSegments.entries()) {
      // TODO: Handle enum types
      const dataAttribute = currentElement.querySelector(
        `DA[name="${daSegment}"], BDA[name="${daSegment}"]`
      );
      if (!dataAttribute) {
        return false;
      }

      // console.log('DA', dataAttribute);

      if (index === daSegments.length - 1) {
        // Do not search for type, because last entry is a leaf node and should be basic type
        break;
      }

      const daType = dataAttribute.getAttribute('type');
      if (!daType) {
        return false;
      }

      const daTypeElement = dataTypeTemplates.querySelector(
        `DAType[id="${daType}"]`
      );
      if (!daTypeElement) {
        return false;
      }

      // console.log('DAType', daTypeElement);

      currentElement = daTypeElement;
    }

    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected isFCDACompatibleWithIED(fcda: Element, ied: Element): boolean {
    const ldInst = fcda.getAttribute('ldInst');
    const lnClass = fcda.getAttribute('lnClass');
    const prefix = fcda.getAttribute('prefix');
    const lnInst = fcda.getAttribute('lnInst');
    const doName = fcda.getAttribute('doName');
    const daName = fcda.getAttribute('daName');

    const daSegments = daName ? daName.split('.') : [];

    if (!ldInst || !lnClass || !doName || !lnInst) {
      return false;
    }

    const doSegments = doName.split('.');

    if (doSegments.length === 0) {
      return false;
    }

    const lDevice = this.queryLDevice(ied, ldInst);
    if (!lDevice) {
      return false;
    }

    const lnQuery = this.buildLnQuery(lnClass, lnInst, prefix);
    const ln = lDevice.querySelector(lnQuery);
    if (!ln) {
      return false;
    }

    const lnType = ln.getAttribute('lnType');
    if (!lnType) {
      return false;
    }

    const dataTypeTemplates =
      ied.parentElement?.querySelector('DataTypeTemplates');
    if (!dataTypeTemplates) {
      return false;
    }

    // console.log(`Checking ${ied.getAttribute('name')} for ${lnType}, ${doSegments}, ${daSegments}`);
    return this.hasDataType(dataTypeTemplates, lnType, doSegments, daSegments);
  }

  // eslint-disable-next-line class-methods-use-this
  protected getCopyControlBlockCopyStatus(
    controlBlock: Element,
    otherIED: Element
  ): ControlBlockCopyStatus {
    const lnQuery = this.buildLnQueryForControl(controlBlock);
    const ln = otherIED.querySelector(lnQuery);

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
      const isCompatible = this.isFCDACompatibleWithIED(fcda, otherIED);

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
      const lnQuery = this.buildLnQueryForControl(o.control);
      const ln = o.ied.querySelector(lnQuery);
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
