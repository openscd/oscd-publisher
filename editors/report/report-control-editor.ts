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
import {
  createDataSet,
  createReportControl,
  find,
  findControlBlockSubscription,
  identity,
  removeControlBlock,
} from '@openenergytools/scl-lib';

import '../dataset/data-set-element-editor.js';
import './report-control-element-editor.js';
import '../../foundation/components/scl-filtered-list.js';
import type { SclFilteredList } from '../../foundation/components/scl-filtered-list.js';
import { styles, updateElementReference } from '../../foundation.js';
import { reportIcon } from '../../foundation/icons.js';

@customElement('report-control-editor')
export class ReportControlEditor extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** SCL change indicator */
  @property({ type: Number })
  editCount = 0;

  @state()
  selectedReportControl?: Element;

  @state()
  selectedDataSet?: Element | null;

  @query('.selectionlist') selectionList!: SclFilteredList;

  @query('mwc-button') selectReportControlButton!: Button;

  @query('mwc-dialog') selectDataSetDialog!: Dialog;

  /** Resets selected Report and its DataSet, if not existing in new doc */
  update(props: Map<string | number | symbol, unknown>): void {
    super.update(props);

    if (props.has('doc') && this.selectedReportControl) {
      const newReportControl = updateElementReference(
        this.doc,
        this.selectedReportControl
      );

      this.selectedReportControl = newReportControl ?? undefined;
      this.selectedDataSet = this.selectedReportControl
        ? updateElementReference(this.doc, this.selectedDataSet!)
        : undefined;

      if (
        !newReportControl &&
        this.selectionList &&
        this.selectionList.selected
      )
        (this.selectionList.selected as ListItem).selected = false;
    }
  }

  private addNewDataSet(control: Element): void {
    const parent = control.parentElement;
    if (!parent) return;

    const insert = createDataSet(parent);
    if (!insert) return;

    const newName = (insert.node as Element).getAttribute('name');
    if (!newName) return;

    const update = { element: control, attributes: { datSet: newName } };

    this.dispatchEvent(newEditEvent([insert, update]));
  }

  private selectDataSet(): void {
    const dataSetElement = (
      this.selectDataSetDialog.querySelector(
        'scl-filtered-list'
      ) as SclFilteredList
    ).selected;
    if (!dataSetElement) return;

    const dataSetName = (dataSetElement as ListItemBase).value;

    const dataSet = this.selectedReportControl?.parentElement?.querySelector(
      `DataSet[name="${dataSetName}"]`
    );
    if (!dataSet) return;

    this.dispatchEvent(
      newEditEvent({
        element: this.selectedReportControl!,
        attributes: { datSet: dataSetName },
      })
    );
    this.selectedDataSet = dataSet;

    this.selectDataSetDialog.close();
  }

  private selectReportControl(evt: Event): void {
    const id = ((evt.target as SclFilteredList).selected as ListItem).value;
    const reportControl = find(this.doc, 'ReportControl', id);
    if (!reportControl) return;

    this.selectedReportControl = reportControl;

    if (this.selectedReportControl) {
      this.selectedDataSet =
        this.selectedReportControl.parentElement?.querySelector(
          `DataSet[name="${this.selectedReportControl.getAttribute('datSet')}"]`
        );
      (evt.target as SclFilteredList).classList.add('hidden');
      this.selectReportControlButton.classList.remove('hidden');
    }
  }

  private renderSelectDataSetDialog(): TemplateResult {
    return html`
      <mwc-dialog heading="Select Data Set">
        <scl-filtered-list activatable @selected=${() => this.selectDataSet()}
          >${Array.from(
            this.selectedReportControl?.parentElement?.querySelectorAll(
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
        </scl-filtered-list>
      </mwc-dialog>
    `;
  }

  private renderElementEditorContainer(): TemplateResult {
    if (this.selectedReportControl !== undefined)
      return html`<div class="elementeditorcontainer">
        <div class="content dataSet">
          ${this.renderSelectDataSetDialog()}
          <data-set-element-editor
            .element=${this.selectedDataSet!}
            .showHeader=${false}
            editCount="${this.editCount}"
          >
            <mwc-icon-button
              slot="change"
              icon="swap_vert"
              ?disabled=${!!findControlBlockSubscription(
                this.selectedReportControl
              ).length}
              @click=${() => this.selectDataSetDialog.show()}
            ></mwc-icon-button>
            <mwc-icon-button
              slot="new"
              icon="playlist_add"
              ?disabled=${!!this.selectedReportControl.getAttribute('datSet')}
              @click="${() => {
                this.addNewDataSet(this.selectedReportControl!);
              }}"
            ></mwc-icon-button
          ></data-set-element-editor>
        </div>
        <report-control-element-editor
          .doc=${this.doc}
          .element=${this.selectedReportControl}
          editCount="${this.editCount}"
        ></report-control-element-editor>
      </div>`;

    return html``;
  }

  private renderSelectionList(): TemplateResult {
    return html`<scl-filtered-list
      activatable
      class="selectionlist"
      @action=${this.selectReportControl}
      >${Array.from(this.doc.querySelectorAll('IED')).flatMap(ied => {
        const ieditem = html`<mwc-list-item
            class="listitem header"
            hasMeta
            noninteractive
            graphic="icon"
            value="${Array.from(ied.querySelectorAll('ReportControl'))
              .map(element => {
                const id = identity(element) as string;
                return typeof id === 'string' ? id : '';
              })
              .join(' ')}"
          >
            <span>${ied.getAttribute('name')}</span>
            <mwc-icon slot="graphic">developer_board</mwc-icon>
            <mwc-icon-button
              slot="meta"
              icon="playlist_add"
              @click=${() => {
                const insert = createReportControl(ied);
                if (insert) this.dispatchEvent(newEditEvent(insert));

                this.requestUpdate();
              }}
            ></mwc-icon-button>
          </mwc-list-item>
          <li divider role="separator"></li>`;

        const reports = Array.from(ied.querySelectorAll('ReportControl')).map(
          reportCb =>
            html`<mwc-list-item
              hasMeta
              twoline
              value="${identity(reportCb)}"
              graphic="icon"
              ><span>${reportCb.getAttribute('name')}</span
              ><span slot="secondary">${identity(reportCb)}</span>
              <span slot="meta"
                ><mwc-icon-button
                  icon="delete"
                  @click=${() => {
                    this.dispatchEvent(
                      newEditEvent(removeControlBlock({ node: reportCb }))
                    );
                    this.requestUpdate();
                  }}
                ></mwc-icon-button>
              </span>
              <mwc-icon slot="graphic">${reportIcon}</mwc-icon>
            </mwc-list-item>`
        );

        return [ieditem, ...reports];
      })}</scl-filtered-list
    >`;
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
