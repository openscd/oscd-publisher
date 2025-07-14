/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import {
  ActionItem,
  ActionList,
} from '@openenergytools/filterable-lists/dist/ActionList.js';
import { MdOutlinedButton } from '@scopedelement/material-web/button/MdOutlinedButton.js';

import { newEditEvent } from '@openenergytools/open-scd-core';
import {
  createDataSet,
  identity,
  removeDataSet,
} from '@openenergytools/scl-lib';

import { DataSetElementEditor } from './data-set-element-editor.js';

import { pathIdentity, styles } from '../../foundation.js';

export class DataSetEditor extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'action-list': ActionList,
    'data-set-element-editor': DataSetElementEditor,
    'md-outlined-button': MdOutlinedButton,
  };

  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = 0;

  @property({ type: String }) searchValue = '';

  private handleSearchChange = (event: CustomEvent) => {
    this.dispatchEvent(
      new CustomEvent('search-change', {
        detail: event.detail,
        bubbles: true,
      })
    );
  };

  @state()
  selectedDataSet?: Element;

  @query('.selectionlist') selectionList!: ActionList;

  @query('.change.scl.element') selectDataSetButton!: MdOutlinedButton;

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
                  this.dispatchEvent(
                    newEditEvent(insertDataSet, { title: `Create New DataSet` })
                  );
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
                  newEditEvent(removeDataSet({ node: dataSet }), {
                    title: `Remove DataSet`,
                  })
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
      .searchValue=${this.searchValue}
      @search-change=${this.handleSearchChange}
      filterable
      searchhelper="Filter DataSet's"
    ></action-list>`;
  }

  private renderToggleButton(): TemplateResult {
    return html`<md-outlined-button
      class="change scl element"
      @click=${() => {
        this.selectionList.classList.remove('hidden');
        this.selectDataSetButton.classList.add('hidden');
      }}
      >Select DataSet</md-outlined-button
    >`;
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

    data-set-element-editor {
      flex: auto;
    }

    md-icon-button[icon='playlist_add'] {
      pointer-events: all;
    }
  `;
}
