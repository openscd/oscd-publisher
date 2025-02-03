/* eslint-disable import/no-extraneous-dependencies */
import { css, html, TemplateResult } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { MdOutlinedButton } from '@scopedelement/material-web/button/MdOutlinedButton.js';

// eslint-disable-next-line import/no-extraneous-dependencies
import { newEditEvent } from '@openenergytools/open-scd-core';
import { createGSEControl, removeControlBlock } from '@openenergytools/scl-lib';
import {
  ActionItem,
  ActionList,
} from '@openenergytools/filterable-lists/dist/ActionList.js';

import './gse-control-element-editor.js';
import type { GseControlElementEditor } from './gse-control-element-editor.js';

import '../dataset/data-set-element-editor.js';
import type { DataSetElementEditor } from '../dataset/data-set-element-editor.js';

import {
  pathIdentity,
  styles,
  //   updateElementReference,
} from '../../foundation.js';
import BaseElementEditor from '../base-element-editor.js';

@customElement('gse-control-editor')
export class GseControlEditor extends BaseElementEditor {
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

  private renderSelectionList(): TemplateResult {
    const items = Array.from(this.doc.querySelectorAll(':root > IED')).flatMap(
      ied => {
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
            this.selectedDataSet =
              gseControl.parentElement?.querySelector(
                `DataSet[name="${gseControl.getAttribute('datSet')}"]`
              ) ?? null;

            this.selectionList.classList.add('hidden');
            this.selectGSEControlButton.classList.remove('hidden');
          },
          actions: [
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
      }
    );

    return html`<action-list
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
  `;
}
