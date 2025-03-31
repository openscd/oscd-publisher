/* eslint-disable import/no-extraneous-dependencies */
import { css, html, TemplateResult } from 'lit';
import { query } from 'lit/decorators.js';

import {
  ActionItem,
  ActionList,
} from '@openenergytools/filterable-lists/dist/ActionList.js';
import { MdDialog } from '@scopedelement/material-web/dialog/MdDialog.js';
import { MdIcon } from '@scopedelement/material-web/icon/MdIcon.js';
import { MdIconButton } from '@scopedelement/material-web/iconbutton/MdIconButton.js';
import { MdOutlinedButton } from '@scopedelement/material-web/button/MdOutlinedButton.js';
import { MdCheckbox } from '@scopedelement/material-web/checkbox/MdCheckbox.js';

// eslint-disable-next-line import/no-extraneous-dependencies
import { newEditEvent } from '@openenergytools/open-scd-core';
import { createGSEControl, removeControlBlock } from '@openenergytools/scl-lib';

import { pathIdentity, styles } from '../../foundation.js';

import { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import { GseControlElementEditor } from './gse-control-element-editor.js';

import {
  BaseElementEditor,
  ControlBlockCopyStatus,
} from '../base-element-editor.js';

export class GseControlEditor extends BaseElementEditor {
  static scopedElements = {
    'action-list': ActionList,
    'data-set-element-editor': DataSetElementEditor,
    'md-outlined-button': MdOutlinedButton,
    'gse-control-element-editor': GseControlElementEditor,
    'md-icon-button': MdIconButton,
    'md-icon': MdIcon,
    'md-dialog': MdDialog,
    'md-checkbox': MdCheckbox,
  };

  @query('.selectionlist') selectionList!: ActionList;

  @query('.change.scl.element') selectGSEControlButton!: MdOutlinedButton;

  @query('gse-control-element-editor')
  gseControlElementEditor!: GseControlElementEditor;

  @query('data-set-element-editor')
  dataSetElementEditor!: DataSetElementEditor;

  /** Resets selected GOOSE and its DataSet, if not existing in new doc 
  update(props: Map<string | number | symbol, unknown>): void {
    super.update(props);

    if (props.has('doc') && this.selectCtrlBlock) {
      const newGseControl = updateElementReference(
        this.doc,
        this.selectCtrlBlock
      );

      this.selectCtrlBlock = newGseControl ?? undefined;
      this.selectedDataSet = this.selectCtrlBlock
        ? updateElementReference(this.doc, this.selectedDataSet!)
        : undefined;

      /* TODO(Jakob Vogelsang): comment when action-list is activeable
      if (!newGseControl && this.selectionList && this.selectionList.selected)
        (this.selectionList.selected as ListItem).selected = false; 
    }
  } */

  protected renderElementEditorContainer(): TemplateResult {
    if (this.selectCtrlBlock !== undefined)
      return html`<div class="elementeditorcontainer">
        ${this.renderDataSetElementContainer()}
        <gse-control-element-editor
          .doc=${this.doc}
          .element=${this.selectCtrlBlock}
          editCount="${this.editCount}"
        ></gse-control-element-editor>
      </div>`;

    return html``;
  }

  // eslint-disable-next-line class-methods-use-this
  protected getCopyControlBlockCopyStatus(
    controlBlock: Element,
    otherIED: Element
  ): ControlBlockCopyStatus {
    const lnQuery = this.buildLnQuery(controlBlock);
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

  private renderSelectionList(): TemplateResult {
    // TODO: Store ieds as objects
    const items = this.queryIEDs().flatMap(ied => {
      const gseControls = Array.from(
        ied.querySelectorAll(
          ':scope > AccessPoint > Server > LDevice > LN0 > GSEControl'
        )
      );

      const item: ActionItem = {
        headline: `${ied.getAttribute('name')}`,
        startingIcon: 'developer_board',
        divider: true,
        filtergroup: gseControls.map(
          gseControl => gseControl.getAttribute('name') ?? ''
        ),
        actions: [
          {
            icon: 'playlist_add',
            callback: () => {
              const insertGseControl = createGSEControl(ied);
              if (insertGseControl)
                this.dispatchEvent(
                  newEditEvent(insertGseControl, {
                    title: 'Create New GSEControl',
                  })
                );
            },
          },
        ],
      };

      const dataset: ActionItem[] = gseControls.map(gseControl => ({
        headline: `${gseControl.getAttribute('name')}`,
        supportingText: `${pathIdentity(gseControl)}`,
        primaryAction: () => {
          if (this.selectCtrlBlock === gseControl) return;

          if (this.gseControlElementEditor)
            this.gseControlElementEditor.resetInputs();

          if (this.dataSetElementEditor)
            this.dataSetElementEditor.resetInputs();

          this.selectCtrlBlock = gseControl;
          this.selectedDataSet = this.getDataSet(gseControl);

          this.selectionList.classList.add('hidden');
          this.selectGSEControlButton.classList.remove('hidden');
        },
        actions: [
          {
            icon: 'folder_copy',
            callback: () => {
              const lDevice = gseControl.closest('LDevice');
              if (!lDevice) {
                throw new Error('GSEControl has no LDevice parent');
              }

              const otherIEDs = this.queryIEDs().filter(
                otherIED => ied !== otherIED
              );

              this.controlBlockCopyOptions = otherIEDs.map(otherIED => {
                const status = this.getCopyControlBlockCopyStatus(
                  gseControl,
                  otherIED
                );

                // console.log(`IED ${otherIED.getAttribute('name')}: ${status}`);

                return {
                  ied: otherIED,
                  control: gseControl,
                  status,
                  selected: status === ControlBlockCopyStatus.CanCopy,
                };
              });

              this.copyControlBlockDialog.show();
            },
          },
          {
            icon: 'delete',
            callback: () => {
              this.dispatchEvent(
                newEditEvent(removeControlBlock({ node: gseControl }), {
                  title: 'Remove GSEControl',
                })
              );

              this.selectCtrlBlock = undefined;
            },
          },
        ],
      }));

      return [item, ...dataset];
    });

    return html` ${this.renderCopyControlBlockDialog()}
      <action-list
        class="selectionlist"
        filterable
        searchhelper="Filter GSEControl's"
        .items=${items}
      ></action-list>`;
  }

  private renderToggleButton(): TemplateResult {
    return html`<md-outlined-button
      class="change scl element"
      @click=${() => {
        this.selectionList.classList.remove('hidden');
        this.selectGSEControlButton.classList.add('hidden');
      }}
      >Selected GOOSE</md-outlined-button
    >`;
  }

  render(): TemplateResult {
    if (!this.doc) return html`No SCL loaded`;

    return html`${this.renderToggleButton()}
      <div class="section">
        ${this.renderSelectionList()}${this.renderElementEditorContainer()}
      </div>`;
  }

  static styles = css`
    ${styles}

    .elementeditorcontainer {
      flex: 65%;
      margin: 4px 8px 4px 4px;
      background-color: var(--mdc-theme-surface);
      overflow-y: scroll;
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      grid-template-columns: repeat(3, 1fr);
      z-index: 0;
    }
    .content.dataSet {
      display: flex;
      flex-direction: column;
    }

    data-set-element-editor {
      grid-column: 1 / 2;
    }

    gse-control-element-editor {
      grid-column: 2 / 4;
    }

    mwc-list-item {
      --mdc-list-item-meta-size: 48px;
    }

    md-icon-button[icon='playlist_add'] {
      pointer-events: all;
    }

    @media (max-width: 950px) {
      .elementeditorcontainer {
        display: block;
      }
    }

    .copy-option-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;
}
