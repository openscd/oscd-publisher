/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list-item';
import type { Button } from '@material/mwc-button';
import type { ListItem } from '@material/mwc-list/mwc-list-item';

import { newEditEvent } from '@openscd/open-scd-core';
import {
  createDataSet,
  find,
  identity,
  removeDataSet,
} from '@openenergytools/scl-lib';

import './data-set-element-editor.js';
import '../../foundation/components/action-filtered-list.js';
import type { ActionFilteredList } from '../../foundation/components/action-filtered-list.js';

import { styles, updateElementReference } from '../../foundation.js';

function dataSetPath(dataSet: Element): string {
  const id = identity(dataSet);
  if (Number.isNaN(id)) return 'UNDEFINED';

  const paths = (id as string).split('>');
  paths.pop();
  return paths.join('>');
}

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

  @query('.selectionlist') selectionList!: ActionFilteredList;

  @query('mwc-button') selectDataSetButton!: Button;

  /** Resets selected GOOSE, if not existing in new doc */
  update(props: Map<string | number | symbol, unknown>): void {
    if (props.has('doc') && this.selectedDataSet) {
      const newDataSet = updateElementReference(this.doc, this.selectedDataSet);

      this.selectedDataSet = newDataSet ?? undefined;

      if (!newDataSet && this.selectionList && this.selectionList.selected)
        (this.selectionList.selected as ListItem).selected = false;
    }

    super.update(props);
  }

  private selectDataSet(evt: Event): void {
    const id = ((evt.target as ActionFilteredList).selected as ListItem).value;
    const dataSet = find(this.doc, 'DataSet', id);

    if (dataSet) {
      this.selectedDataSet = dataSet;
      (evt.target as ActionFilteredList).classList.add('hidden');
      this.selectDataSetButton.classList.remove('hidden');
    }
  }

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
    return html`<action-filtered-list
      activatable
      @action=${this.selectDataSet}
      class="selectionlist"
      >${Array.from(this.doc.querySelectorAll('IED')).flatMap(ied => {
        const ieditem = html`<mwc-list-item
            class="listitem header"
            noninteractive
            graphic="icon"
            value="${Array.from(ied.querySelectorAll('DataSet'))
              .map(element => {
                const id = identity(element) as string;
                return typeof id === 'string' ? id : '';
              })
              .join(' ')}"
          >
            <span>${ied.getAttribute('name')}</span>
            <mwc-icon slot="graphic">developer_board</mwc-icon>
          </mwc-list-item>
          <li divider role="separator"></li>
          <mwc-list-item
            slot="primaryAction"
            style="height:56px;"
            @request-selected="${(evt: Event) => {
              evt.stopPropagation();

              const insertDataSet = createDataSet(ied);
              if (insertDataSet)
                this.dispatchEvent(newEditEvent(insertDataSet));
            }}"
            ><mwc-icon>playlist_add</mwc-icon></mwc-list-item
          >
          <li slot="primaryAction" divider role="separator"></li>`;

        const dataSets = Array.from(ied.querySelectorAll('DataSet')).map(
          dataSet =>
            html`<mwc-list-item twoline value="${identity(dataSet)}"
                ><span>${dataSet.getAttribute('name')}</span
                ><span slot="secondary">${dataSetPath(dataSet)}</span>
                <span slot="meta"
                  ><mwc-icon-button icon="delete"></mwc-icon-button>
                </span>
              </mwc-list-item>
              <mwc-list-item
                style="height:72px;"
                slot="primaryAction"
                @request-selected="${(evt: Event) => {
                  evt.stopPropagation();
                  this.dispatchEvent(
                    newEditEvent(removeDataSet({ node: dataSet }))
                  );
                  // this.requestUpdate();
                }}"
              >
                <mwc-icon>delete</mwc-icon>
              </mwc-list-item>`
        );

        return [ieditem, ...dataSets];
      })}</action-filtered-list
    >`;
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

    mwc-icon-button[icon='playlist_add'] {
      pointer-events: all;
    }

    mwc-list-item {
      --mdc-list-item-meta-size: 48px;
    }
  `;
}
