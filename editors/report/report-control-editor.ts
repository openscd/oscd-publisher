/* eslint-disable import/no-extraneous-dependencies */
import { css, html, TemplateResult } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import '@material/mwc-button';
import type { Button } from '@material/mwc-button';

import '@openenergytools/filterable-lists/dist/action-list.js';
import { newEditEvent } from '@openscd/open-scd-core';
import {
  createReportControl,
  identity,
  removeControlBlock,
} from '@openenergytools/scl-lib';
import type {
  ActionItem,
  ActionList,
} from '@openenergytools/filterable-lists/dist/action-list.js';

import './report-control-element-editor.js';
import '../dataset/data-set-element-editor.js';
import type { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import type { ReportControlElementEditor } from './report-control-element-editor.js';

import {
  pathIdentity,
  styles,
  //  updateElementReference,
} from '../../foundation.js';
import BaseElementEditor from '../base-element-editor.js';

@customElement('report-control-editor')
export class ReportControlEditor extends BaseElementEditor {
  @query('.selectionlist') selectionList!: ActionList;

  @query('mwc-button') selectReportControlButton!: Button;

  @query('report-control-element-editor')
  rpControlElementEditor!: ReportControlElementEditor;

  @query('data-set-element-editor')
  dataSetElementEditor!: DataSetElementEditor;

  /** Resets selected Report and its DataSet, if not existing in new doc 
  update(props: Map<string | number | symbol, unknown>): void {
    super.update(props);

    if (props.has('doc') && this.selectCtrlBlock) {
      const newReportControl = updateElementReference(
        this.doc,
        this.selectCtrlBlock
      );

      this.selectCtrlBlock = newReportControl ?? undefined;
      this.selectedDataSet = this.selectCtrlBlock
        ? updateElementReference(this.doc, this.selectedDataSet!)
        : undefined;

      /* TODO(Jakob Vogelsang): fix when action-list is activable
      if (
        !newReportControl &&
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
        <report-control-element-editor
          .doc=${this.doc}
          .element=${this.selectCtrlBlock}
          editCount="${this.editCount}"
        ></report-control-element-editor>
      </div>`;

    return html``;
  }

  private renderSelectionList(): TemplateResult {
    const items = Array.from(this.doc.querySelectorAll(':root > IED')).flatMap(
      ied => {
        const rpControls = Array.from(
          ied.querySelectorAll(
            ':scope > AccessPoint > Server > LDevice > LN0 > ReportControl, :scope > AccessPoint > Server > LDevice > LN > ReportControl'
          )
        );

        const item: ActionItem = {
          headline: `${ied.getAttribute('name')}`,
          startingIcon: 'developer_board',
          divider: true,
          filtergroup: rpControls.map(rpControl => `${identity(rpControl)}`),
          actions: [
            {
              icon: 'playlist_add',
              callback: () => {
                const insertGseControl = createReportControl(ied);
                if (insertGseControl)
                  this.dispatchEvent(newEditEvent(insertGseControl));
              },
            },
          ],
        };

        const reports: ActionItem[] = rpControls.map(rpControl => ({
          headline: `${rpControl.getAttribute('name')}`,
          supportingText: `${pathIdentity(rpControl)}`,
          primaryAction: () => {
            if (this.selectCtrlBlock === rpControl) return;

            if (this.rpControlElementEditor)
              this.rpControlElementEditor.resetInputs();

            if (this.dataSetElementEditor)
              this.dataSetElementEditor.resetInputs();

            this.selectCtrlBlock = rpControl;
            this.selectedDataSet =
              rpControl.parentElement?.querySelector(
                `:scope > DataSet[name="${rpControl.getAttribute('datSet')}"]`
              ) ?? null;

            this.selectionList.classList.add('hidden');
            this.selectReportControlButton.classList.remove('hidden');
          },
          actions: [
            {
              icon: 'delete',
              callback: () => {
                this.dispatchEvent(
                  newEditEvent(removeControlBlock({ node: rpControl }))
                );

                this.selectCtrlBlock = undefined;
              },
            },
          ],
        }));

        return [item, ...reports];
      }
    );

    return html`<action-list
      class="selectionlist"
      filterable
      searchhelper="Filter ReportControl's"
      .items=${items}
    ></action-list>`;
  }

  private renderToggleButton(): TemplateResult {
    return html`<mwc-button
      class="change scl element"
      outlined
      label="Select Report"
      @click=${() => {
        this.selectionList.classList.remove('hidden');
        this.selectReportControlButton.classList.add('hidden');
      }}
    ></mwc-button>`;
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
    }

    .content.dataSet {
      display: flex;
      flex-direction: column;
    }

    .selectionlist {
      z-index: 2;
    }

    mwc-list-item {
      --mdc-list-item-meta-size: 48px;
    }

    mwc-icon-button[icon='playlist_add'] {
      pointer-events: all;
    }

    data-set-element-editor {
      grid-column: 1 / 2;
    }

    report-control-element-editor {
      grid-column: 2 / 4;
    }

    @media (max-width: 950px) {
      .elementeditorcontainer {
        display: block;
      }
    }
  `;
}
