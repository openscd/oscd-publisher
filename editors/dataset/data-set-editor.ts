/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import '@material/mwc-button';
import type { Button } from '@material/mwc-button';

import { newEditEvent } from '@openscd/open-scd-core';
import {
  createDataSet,
  identity,
  removeDataSet,
} from '@openenergytools/scl-lib';
import '@openenergytools/filterable-lists/dist/action-list.js';
import type {
  ActionItem,
  ActionList,
} from '@openenergytools/filterable-lists/dist/action-list.js';

import './data-set-element-editor.js';
import type { DataSetElementEditor } from './data-set-element-editor.js';

import {
  pathIdentity,
  styles,
  //  updateElementReference,
} from '../../foundation.js';

@customElement('data-set-editor')
export class DataSetEditor extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = 0;

  @state()
  selectedDataSet?: Element;

  @query('.selectionlist') selectionList!: ActionList;

  @query('mwc-button') selectDataSetButton!: Button;

  @query('data-set-element-editor')
  dataSetElementEditor!: DataSetElementEditor;

  /** Resets selected DataSet, if not existing in new doc 
  update(props: Map<string | number | symbol, unknown>): void {
    if (props.has('doc') && this.selectedDataSet) {
      const newDataSet = updateElementReference(this.doc, this.selectedDataSet);

      this.selectedDataSet = newDataSet ?? undefined;

      /* TODO(Jakob Vogelsang): fix when action-list is activable
      if (!newDataSet && this.selectionList && this.selectionList.selected)
        (this.selectionList.selected as ListItem).selected = false; 
    }

    super.update(props);
  } */

  private renderElementEditorContainer(): TemplateResult {
    if (this.selectedDataSet)
      return html`<div class="elementeditorcontainer">
        <data-set-element-editor
          .element=${this.selectedDataSet}
          editCount="${this.editCount}"
        ></data-set-element-editor>
      </div>`;

    return html``;
  }

  private renderSelectionList(): TemplateResult {
    const items = Array.from(this.doc.querySelectorAll(':root > IED')).flatMap(
      ied => {
        const dataSets = Array.from(
          ied.querySelectorAll(
            ':scope > AccessPoint > Server > LDevice > LN0 > DataSet, :scope > AccessPoint > Server > LDevice > LN > DataSet'
          )
        );

        const item: ActionItem = {
          headline: `${ied.getAttribute('name')}`,
          startingIcon: 'developer_board',
          divider: true,
          filtergroup: dataSets.map(dataset => `${identity(dataset)}`),
          actions: [
            {
              icon: 'playlist_add',
              callback: () => {
                const insertDataSet = createDataSet(ied);
                if (insertDataSet)
                  this.dispatchEvent(newEditEvent(insertDataSet));
              },
            },
          ],
        };

        const dataset: ActionItem[] = dataSets.map(dataSet => ({
          headline: `${dataSet.getAttribute('name')}`,
          supportingText: `${pathIdentity(dataSet)}`,
          primaryAction: () => {
            if (this.selectedDataSet === dataSet) return;

            if (this.dataSetElementEditor)
              this.dataSetElementEditor.resetInputs();

            this.selectedDataSet = dataSet;
            this.selectionList.classList.add('hidden');
            this.selectDataSetButton.classList.remove('hidden');
          },
          actions: [
            {
              icon: 'delete',
              callback: () => {
                this.dispatchEvent(
                  newEditEvent(removeDataSet({ node: dataSet }))
                );

                this.selectedDataSet = undefined;
              },
            },
          ],
        }));

        return [item, ...dataset];
      }
    );

    return html`<action-list
      class="selectionlist"
      .items=${items}
      filterable
      searchhelper="Filter DataSet's"
    ></action-list>`;
  }

  private renderToggleButton(): TemplateResult {
    return html`<mwc-button
      class="change scl element"
      outlined
      label="Select DataSet"
      @click=${() => {
        this.selectionList.classList.remove('hidden');
        this.selectDataSetButton.classList.add('hidden');
      }}
    ></mwc-button>`;
  }

  render(): TemplateResult {
    if (!this.doc) return html`<div>No SCL loaded</div>`;

    return html`${this.renderToggleButton()}
      <div class="section">
        ${this.renderSelectionList()}${this.renderElementEditorContainer()}
      </div>`;
  }

  static styles = css`
    ${styles}

    .selectionlist {
      z-index: 2;
    }

    data-set-element-editor {
      flex: auto;
    }

    mwc-icon-button[icon='playlist_add'] {
      pointer-events: all;
    }

    mwc-list-item {
      --mdc-list-item-meta-size: 48px;
    }
  `;
}
