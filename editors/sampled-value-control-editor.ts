/* eslint-disable import/no-extraneous-dependencies */
import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import '@material/mwc-button';
import '@material/mwc-list/mwc-list-item';
import type { Button } from '@material/mwc-button';
import type { Dialog } from '@material/mwc-dialog';
import type { ListItem } from '@material/mwc-list/mwc-list-item';
import { ListItemBase } from '@material/mwc-list/mwc-list-item-base.js';

import { newEditEvent } from '@openscd/open-scd-core';

import './data-set-element-editor.js';
import '../foundation/components/oscd-filtered-list.js';
import './sampled-value-control-element-editor.js';
import type { OscdFilteredList } from '../foundation/components/oscd-filtered-list.js';

import { styles, updateElementReference } from '../foundation.js';
import { selector } from '../foundation/identities/selector.js';
import { identity } from '../foundation/identities/identity.js';
import { smvIcon } from '../foundation/icons.js';
import {
  findCtrlBlockSubscription,
  removeControlBlock,
} from '../foundation/utils/controlBlocks.js';

@customElement('sampled-value-control-editor')
export class SampledValueControlEditor extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  @state()
  selectedSampledValueControl?: Element;

  @state()
  selectedDataSet?: Element | null;

  @query('.selectionlist') selectionList!: OscdFilteredList;

  @query('mwc-button') selectSampledValueControlButton!: Button;

  @query('mwc-dialog') selectDataSetDialog!: Dialog;

  /** Resets selected SMV and its DataSet, if not existing in new doc */
  update(props: Map<string | number | symbol, unknown>): void {
    super.update(props);

    if (props.has('doc') && this.selectedSampledValueControl) {
      const newSampledValueControl = updateElementReference(
        this.doc,
        this.selectedSampledValueControl
      );

      this.selectedSampledValueControl = newSampledValueControl ?? undefined;
      this.selectedDataSet = this.selectedSampledValueControl
        ? updateElementReference(this.doc, this.selectedDataSet!)
        : undefined;

      if (
        !newSampledValueControl &&
        this.selectionList &&
        this.selectionList.selected
      )
        (this.selectionList.selected as ListItem).selected = false;
    }
  }

  private selectDataSet(): void {
    const dataSetElement = (
      this.selectDataSetDialog.querySelector(
        'oscd-filtered-list'
      ) as OscdFilteredList
    ).selected;
    if (!dataSetElement) return;

    const dataSetName = (dataSetElement as ListItemBase).value;
    const dataSet =
      this.selectedSampledValueControl?.parentElement?.querySelector(
        `DataSet[name="${dataSetName}"]`
      );
    if (!dataSet) return;

    this.dispatchEvent(
      newEditEvent({
        element: this.selectedSampledValueControl!,
        attributes: { datSet: dataSetName },
      })
    );
    this.selectedDataSet = dataSet;

    this.selectDataSetDialog.close();
  }

  private selectSMVControl(evt: Event): void {
    const id = ((evt.target as OscdFilteredList).selected as ListItem).value;
    const smvControl = this.doc.querySelector(
      selector('SampledValueControl', id)
    );
    if (!smvControl) return;

    this.selectedSampledValueControl = smvControl;

    if (smvControl) {
      this.selectedDataSet =
        smvControl.parentElement?.querySelector(
          `DataSet[name="${smvControl.getAttribute('datSet')}"]`
        ) ?? null;
      (evt.target as OscdFilteredList).classList.add('hidden');
      this.selectSampledValueControlButton.classList.remove('hidden');
    }
  }

  private renderSelectDataSetDialog(): TemplateResult {
    return html`
      <mwc-dialog heading="Select Data Set">
        <oscd-filtered-list activatable @selected=${() => this.selectDataSet()}
          >${Array.from(
            this.selectedSampledValueControl?.parentElement?.querySelectorAll(
              'DataSet'
            ) ?? []
          ).map(
            dataSet =>
              html`<mwc-list-item
                twoline
                ?selected=${(this.selectedDataSet?.getAttribute('name') ??
                  'UNDEFINED') ===
                (dataSet.getAttribute('name') ?? 'UNDEFINED')}
                value="${dataSet.getAttribute('name') ?? 'UNDEFINED'}"
                ><span>${dataSet.getAttribute('name') ?? 'UNDEFINED'}</span>
                <span slot="secondary">${identity(dataSet)}</span>
              </mwc-list-item>`
          )}
        </oscd-filtered-list>
      </mwc-dialog>
    `;
  }

  private renderElementEditorContainer(): TemplateResult {
    if (this.selectedSampledValueControl !== undefined)
      return html`<div class="elementeditorcontainer">
        <div class="content dataSet">
          ${this.renderSelectDataSetDialog()}
          <data-set-element-editor
            .element=${this.selectedDataSet!}
            .showHeader=${false}
          >
            <mwc-icon-button
              slot="change"
              icon="swap_vert"
              ?disabled=${!!findCtrlBlockSubscription(
                this.selectedSampledValueControl
              ).length}
              @click=${() => this.selectDataSetDialog.show()}
            ></mwc-icon-button
          ></data-set-element-editor>
        </div>
        <sampled-value-control-element-editor
          .doc=${this.doc}
          .element=${this.selectedSampledValueControl}
        ></sampled-value-control-element-editor>
      </div>`;

    return html``;
  }

  private renderSelectionList(): TemplateResult {
    return html`<oscd-filtered-list
      activatable
      @action=${this.selectSMVControl}
      class="selectionlist"
      >${Array.from(this.doc.querySelectorAll('IED')).flatMap(ied => {
        const ieditem = html`<mwc-list-item
            class="listitem header"
            noninteractive
            graphic="icon"
            value="${Array.from(ied.querySelectorAll('SampledValueControl'))
              .map(element => {
                const id = identity(element) as string;
                return typeof id === 'string' ? id : '';
              })
              .join(' ')}"
          >
            <span>${ied.getAttribute('name')}</span>
            <mwc-icon slot="graphic">developer_board</mwc-icon>
          </mwc-list-item>
          <li divider role="separator"></li>`;

        const sampledValueControls = Array.from(
          ied.querySelectorAll('SampledValueControl')
        ).map(
          smvControl =>
            html`<mwc-list-item
              hasMeta
              twoline
              value="${identity(smvControl)}"
              graphic="icon"
              ><span>${smvControl.getAttribute('name')}</span
              ><span slot="secondary">${identity(smvControl)}</span>
              <span slot="meta"
                ><mwc-icon-button
                  icon="delete"
                  @click=${() => {
                    this.dispatchEvent(
                      newEditEvent(removeControlBlock(smvControl))
                    );
                    this.requestUpdate();
                  }}
                ></mwc-icon-button>
              </span>
              <mwc-icon slot="graphic">${smvIcon}</mwc-icon>
            </mwc-list-item>`
        );

        return [ieditem, ...sampledValueControls];
      })}</oscd-filtered-list
    >`;
  }

  private renderToggleButton(): TemplateResult {
    return html`<mwc-button
      class="change scl element"
      outlined
      label="'publisher.selectbutton', { type: 'SMV' })}"
      @click=${() => {
        this.selectionList.classList.remove('hidden');
        this.selectSampledValueControlButton.classList.add('hidden');
      }}
    ></mwc-button>`;
  }

  render(): TemplateResult {
    return html`${this.renderToggleButton()}
      <div class="content">
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
