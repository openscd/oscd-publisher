import { LitElement, TemplateResult, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import '@material/mwc-dialog';
import '@material/mwc-icon-button';
import type { Dialog } from '@material/mwc-dialog';
import type { IconButton } from '@material/mwc-icon-button';

// eslint-disable-next-line import/no-extraneous-dependencies
import { newEditEvent } from '@openenergytools/open-scd-core';
import {
  createDataSet,
  findControlBlockSubscription,
  identity,
} from '@openenergytools/scl-lib';
import '@openenergytools/filterable-lists/dist/action-list.js';

import './dataset/data-set-element-editor.js';

export default class BaseElementEditor extends LitElement {
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

  @query('mwc-dialog') selectDataSetDialog!: Dialog;

  @query('.new.dataset') newDataSet!: IconButton;

  @query('.change.dataset') changeDataSet!: IconButton;

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

    return html`<mwc-dialog>
      <action-list .items=${items} filterable></action-list>
    </mwc-dialog>`;
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
          <mwc-icon-button
            class="change dataset"
            slot="change"
            icon="swap_vert"
            ?disabled=${!!findControlBlockSubscription(this.selectCtrlBlock!)
              .length}
            @click=${() => this.selectDataSetDialog.show()}
          ></mwc-icon-button>
          <mwc-icon-button
            class="new dataset"
            slot="new"
            icon="playlist_add"
            ?disabled=${!!this.selectCtrlBlock!.getAttribute('datSet')}
            @click="${() => {
              this.addNewDataSet(this.selectCtrlBlock!);
            }}"
          ></mwc-icon-button
        ></data-set-element-editor>
      </div>
    `;
  }
}
