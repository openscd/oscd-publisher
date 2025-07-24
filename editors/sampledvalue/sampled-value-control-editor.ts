/* eslint-disable import/no-extraneous-dependencies */
import { css, html, TemplateResult } from 'lit';
import { query, property } from 'lit/decorators.js';

import {
  ActionItem,
  ActionList,
} from '@openenergytools/filterable-lists/dist/ActionList.js';
import { MdDialog } from '@scopedelement/material-web/dialog/MdDialog.js';
import { MdIcon } from '@scopedelement/material-web/icon/MdIcon.js';
import { MdIconButton } from '@scopedelement/material-web/iconbutton/MdIconButton.js';
import { MdOutlinedButton } from '@scopedelement/material-web/button/MdOutlinedButton.js';
import { MdCheckbox } from '@scopedelement/material-web/checkbox/MdCheckbox.js';

import { newEditEvent } from '@openenergytools/open-scd-core';
import { identity, removeControlBlock } from '@openenergytools/scl-lib';

import { styles } from '../../foundation.js';
import {
  BaseElementEditor,
  ControlBlockCopyStatus,
} from '../base-element-editor.js';

import { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import { SampledValueControlElementEditor } from './sampled-value-control-element-editor.js';

function smvControlPath(smvControl: Element): string {
  const id = identity(smvControl);
  if (Number.isNaN(id)) return 'UNDEFINED';

  const paths = (id as string).split('>');
  paths.pop();
  return paths.join('>');
}

export class SampledValueControlEditor extends BaseElementEditor {
  static scopedElements = {
    'action-list': ActionList,
    'data-set-element-editor': DataSetElementEditor,
    'md-outlined-button': MdOutlinedButton,
    'sampled-value-control-element-editor': SampledValueControlElementEditor,
    'md-icon-button': MdIconButton,
    'md-icon': MdIcon,
    'md-dialog': MdDialog,
    'md-checkbox': MdCheckbox,
  };

  @property({ type: String }) searchValue = '';

  @query('.selectionlist') selectionList!: ActionList;

  @query('.change.scl.element')
  selectSampledValueControlButton!: MdOutlinedButton;

  @query('sampled-value-control-element-editor')
  elementContainer?: SampledValueControlElementEditor;

  @query('data-set-element-editor')
  dataSetElementEditor!: DataSetElementEditor;

  /** Resets selected SMV and its DataSet, if not existing in new doc 
  update(props: Map<string | number | symbol, unknown>): void {
    super.update(props);

    if (props.has('doc') && this.selectCtrlBlock) {
      const newSampledValueControl = updateElementReference(
        this.doc,
        this.selectCtrlBlock
      );

      this.selectCtrlBlock = newSampledValueControl ?? undefined;
      this.selectedDataSet = this.selectCtrlBlock
        ? updateElementReference(this.doc, this.selectedDataSet!)
        : undefined;

      // TODO(JakobVogelsang): add activeable to ActionList
      /* if (
        !newSampledValueControl &&
        this.selectionList &&
        this.selectionList.selected
      )
        (this.selectionList.selected as ListItem).selected = false; 
    }
  } */

  updated(changedProps: Map<string | number | symbol, unknown>) {
    super.updated?.(changedProps);
    if (changedProps.has('searchValue') && this.selectionList) {
      this.selectionList.searchValue = this.searchValue;
    }
  }

  private renderElementEditorContainer(): TemplateResult {
    if (this.selectCtrlBlock !== undefined)
      return html`<div class="elementeditorcontainer">
        ${this.renderDataSetElementContainer()}
        <sampled-value-control-element-editor
          .doc=${this.doc}
          .element=${this.selectCtrlBlock}
          editCount="${this.editCount}"
        ></sampled-value-control-element-editor>
      </div>`;

    return html``;
  }

  private renderSelectionList(): TemplateResult {
    const items = Array.from(this.doc.querySelectorAll(':root > IED')).flatMap(
      ied => {
        const smvControls = Array.from(
          ied.querySelectorAll(
            ':scope > AccessPoint > Server > LDevice > LN0 > SampledValueControl'
          )
        );

        const item: ActionItem = {
          headline: `${ied.getAttribute('name')}`,
          startingIcon: 'developer_board',
          divider: true,
          filtergroup: smvControls.map(smvControl => `${identity(smvControl)}`),
        };

        const sampledValues: ActionItem[] = smvControls.map(smvControl => ({
          headline: `${smvControl.getAttribute('name')}`,
          supportingText: `${smvControlPath(smvControl)}`,
          primaryAction: () => {
            if (this.selectCtrlBlock === smvControl) return;

            if (this.elementContainer) this.elementContainer.resetInputs();

            if (this.dataSetElementEditor)
              this.dataSetElementEditor.resetInputs();

            this.selectCtrlBlock = smvControl;
            this.selectedDataSet =
              smvControl.parentElement?.querySelector(
                `DataSet[name="${smvControl.getAttribute('datSet')}"]`
              ) ?? null;

            this.selectionList.classList.add('hidden');
            this.selectSampledValueControlButton.classList.remove('hidden');
          },
          actions: [
            {
              icon: 'folder_copy',
              callback: () => {
                const lDevice = smvControl.closest('LDevice');
                if (!lDevice) {
                  throw new Error('GSEControl has no LDevice parent');
                }

                const otherIEDs = this.queryIEDs().filter(
                  otherIED => ied !== otherIED
                );

                this.controlBlockCopyOptions = otherIEDs.map(otherIED => {
                  const status = this.getCopyControlBlockCopyStatus(
                    smvControl,
                    otherIED
                  );

                  return {
                    ied: otherIED,
                    control: smvControl,
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
                  newEditEvent(removeControlBlock({ node: smvControl }), {
                    title: `Remove SampledValueControl`,
                  })
                );

                this.selectCtrlBlock = undefined;
              },
            },
          ],
        }));

        return [item, ...sampledValues];
      }
    );

    return html` ${this.renderCopyControlBlockDialog()}
      <action-list
        class="selectionlist"
        filterable
        searchhelper="Filter SampledValueControl's"
        .items=${items}
      ></action-list>`;
  }

  private renderToggleButton(): TemplateResult {
    return html`<md-outlined-button
      class="change scl element"
      @click=${() => {
        this.selectionList.classList.remove('hidden');
        this.selectSampledValueControlButton.classList.add('hidden');
      }}
      >Select Sampled Value Control</md-outlined-button
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

    mwc-list-item {
      --mdc-list-item-meta-size: 48px;
    }

    data-set-element-editor {
      grid-column: 1 / 2;
    }

    sampled-value-control-element-editor {
      grid-column: 2 / 4;
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

    .copy-button {
      align-self: flex-end;
    }

    .copy-optin-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .copy-option-description {
      min-width: 240px;
    }

    .copy-option-description-ied {
      font-weight: bold;
    }

    .copy-option-description-status {
      font-size: 0.8em;
    }
  `;
}
