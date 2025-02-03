/* eslint-disable import/no-extraneous-dependencies */
import { css, html, TemplateResult } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { MdOutlinedButton } from '@scopedelement/material-web/button/MdOutlinedButton.js';

// eslint-disable-next-line import/no-extraneous-dependencies
import { newEditEvent } from '@openenergytools/open-scd-core';
import { identity, removeControlBlock } from '@openenergytools/scl-lib';
import {
  ActionItem,
  ActionList,
} from '@openenergytools/filterable-lists/dist/ActionList.js';

import './sampled-value-control-element-editor.js';
import '../dataset/data-set-element-editor.js';
import type { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import type { SampledValueControlElementEditor } from './sampled-value-control-element-editor.js';

// import { styles, updateElementReference } from '../../foundation.js';
import { styles } from '../../foundation.js';
import BaseElementEditor from '../base-element-editor.js';

function smvControlPath(smvControl: Element): string {
  const id = identity(smvControl);
  if (Number.isNaN(id)) return 'UNDEFINED';

  const paths = (id as string).split('>');
  paths.pop();
  return paths.join('>');
}

@customElement('sampled-value-control-editor')
export class SampledValueControlEditor extends BaseElementEditor {
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

    return html`<action-list
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
  `;
}
