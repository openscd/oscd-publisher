/* eslint-disable import/no-extraneous-dependencies */
import { LitElement, TemplateResult, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { MdDialog } from '@scopedelement/material-web/dialog/MdDialog.js';
import type { MdIconButton } from '@scopedelement/material-web/iconbutton/MdIconButton.js';

import { newEditEvent } from '@openenergytools/open-scd-core';
import {
  createDataSet,
  findControlBlockSubscription,
  identity,
} from '@openenergytools/scl-lib';
import '@openenergytools/filterable-lists/dist/action-list.js';

export class BaseElementEditor extends ScopedElementsMixin(LitElement) {
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

  @query('.dialog.select') selectDataSetDialog!: MdDialog;

  @query('.new.dataset') newDataSet!: MdIconButton;

  @query('.change.dataset') changeDataSet!: MdIconButton;

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

  private showSelectDataSetDialog(): void {
    this.selectDataSetDialog.show();
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

    return html`<md-dialog class="dialog select">
      <action-list slot="content" .items=${items} filterable></action-list>
    </md-dialog>`;
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
          <md-icon-button
            class="change dataset"
            slot="change"
            ?disabled=${!!findControlBlockSubscription(this.selectCtrlBlock!)
              .length}
            @click=${this.showSelectDataSetDialog}
            ><md-icon>swap_vert</md-icon></md-icon-button
          >
          <md-icon-button
            class="new dataset"
            slot="new"
            ?disabled=${!!this.selectCtrlBlock!.getAttribute('datSet')}
            @click="${() => {
              this.addNewDataSet(this.selectCtrlBlock!);
            }}"
            ><md-icon>playlist_add</md-icon></md-icon-button
          ></data-set-element-editor
        >
      </div>
    `;
  }
}
