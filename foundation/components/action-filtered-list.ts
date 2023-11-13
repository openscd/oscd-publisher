/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-expressions */
import { css, html, LitElement, TemplateResult, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import '@material/mwc-checkbox';
import '@material/mwc-formfield';
// eslint-disable-next-line import/no-duplicates
import '@material/mwc-list/mwc-list-item-base';
import '@material/mwc-textfield';
import { CheckListItem } from '@material/mwc-list/mwc-check-list-item';
import { List } from '@material/mwc-list';
import type { TextField } from '@material/mwc-textfield';
// eslint-disable-next-line import/no-duplicates
import { ListItemBase } from '@material/mwc-list/mwc-list-item-base';

function infoItems(list: List): ListItemBase[] {
  return (list.querySelector('slot')?.assignedElements() ?? []).filter(
    item => item instanceof ListItemBase
  ) as ListItemBase[];
}

function actionItems(actionList: List): Element[] {
  return (actionList.querySelector('slot')?.assignedElements() ?? []).filter(
    item => item.tagName !== 'LI'
  );
}

function slotItem(item: Element): Element {
  if (!item.closest('action-filtered-list') || !item.parentElement) return item;
  if (item.parentElement instanceof ActionFilteredList) return item;
  return slotItem(item.parentElement);
}

function hideFiltered(
  infoItem: ListItemBase,
  searchText: string,
  siblingActionItems: Element[]
): void {
  const itemInnerText = `${infoItem.innerText}\n`;
  const childInnerText = Array.from(infoItem.children)
    .map(child => (<HTMLElement>child).innerText)
    .join('\n');
  const { value } = infoItem;

  const filterTarget: string = (
    itemInnerText +
    childInnerText +
    value
  ).toUpperCase();

  const terms: string[] = searchText
    .toUpperCase()
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .trim()
    .split(/\s+/g);

  const isEmptyFilter = terms.length === 1 && terms[0] === '';
  const meetsFilter = terms.every(term => {
    const reTerm = new RegExp(
      `*${term}*`.replace(/\*/g, '.*').replace(/\?/g, '.{1}'),
      'i'
    );
    return reTerm.test(filterTarget);
  });

  if (isEmptyFilter || meetsFilter) {
    siblingActionItems.forEach(actionItem =>
      slotItem(actionItem).classList.remove('hidden')
    );
    slotItem(infoItem).classList.remove('hidden');
  } else {
    siblingActionItems.forEach(actionItem =>
      slotItem(actionItem).classList.add('hidden')
    );
    slotItem(infoItem).classList.add('hidden');
  }
}

export function redispatchEvent(element: LitElement, event: Event) {
  element.requestUpdate();
  const copy = Reflect.construct(event.constructor, [event.type, event]);
  if (event.bubbles && (!element.shadowRoot || event.composed)) {
    event.stopPropagation();
    copy.stopPropagation();
  }

  const dispatched = element.dispatchEvent(copy);
  if (!dispatched) {
    event.preventDefault();
  }
  return dispatched;
}

@customElement('action-filtered-list')
export class ActionFilteredList extends LitElement {
  @property({ type: String }) searchFieldLabel?: string;

  @property({ type: Boolean }) disableCheckAll = false;

  @property({ type: Boolean }) multi = false;

  @property({ type: Boolean }) activatable = false;

  get selected() {
    return this.infoList.selected;
  }

  get index() {
    return this.infoList.index;
  }

  @property({ attribute: false })
  items: ListItemBase[] = [];

  @state()
  private get existCheckListItem(): boolean {
    return this.items.some(item => item instanceof CheckListItem);
  }

  @state()
  private get isAllSelected(): boolean {
    return this.items
      .filter(item => !item.disabled)
      .filter(item => item instanceof CheckListItem)
      .every(checkItem => checkItem.selected);
  }

  @state()
  private get isSomeSelected(): boolean {
    return this.items
      .filter(item => !item.disabled)
      .filter(item => item instanceof CheckListItem)
      .some(checkItem => checkItem.selected);
  }

  @query('.list.info') infoList!: List;

  @query('.list.primary') listPrimary!: List;

  @query('.list.secondary') listSecondary!: List;

  @query('.search.input') searchField!: TextField;

  private onCheckAll(): void {
    const select = !this.isAllSelected;
    this.items
      .filter(item => !item.disabled && !item.classList.contains('hidden'))
      .forEach(item => {
        // eslint-disable-next-line no-param-reassign
        item.selected = select;
      });
  }

  onFilterInput(): void {
    infoItems(this.infoList).forEach(item => {
      const index = infoItems(this.infoList).indexOf(item);
      const siblingActionItems: Element[] = [];
      const primaryItem = actionItems(this.listPrimary)[index] ?? undefined;
      if (primaryItem) siblingActionItems.push(primaryItem);
      const secondaryItem = actionItems(this.listSecondary)[index] ?? undefined;
      if (secondaryItem) siblingActionItems.push(secondaryItem);

      hideFiltered(item, this.searchField.value, siblingActionItems);
    });
  }

  firstUpdated(): void {
    this.items = this.infoList.items;
  }

  updated(): void {
    this.items = this.infoList.items;
  }

  constructor() {
    super();

    this.addEventListener('selected', event => {
      redispatchEvent(this, event);
    });
    this.addEventListener('action', event => {
      redispatchEvent(this, event);
    });
  }

  private renderCheckAll(): TemplateResult {
    return this.existCheckListItem && !this.disableCheckAll
      ? html` <mwc-formfield class="checkall">
          <mwc-checkbox
            ?indeterminate=${!this.isAllSelected && this.isSomeSelected}
            ?checked=${this.isAllSelected}
            @change=${() => {
              this.onCheckAll();
            }}
          >
          </mwc-checkbox>
        </mwc-formfield>`
      : html``;
  }

  render(): TemplateResult {
    return html`<div class="search container">
        <abbr title="Filter">
          <mwc-textfield
            class="search input"
            label="${this.searchFieldLabel ?? ''}"
            iconTrailing="search"
            outlined
            @input=${() => this.onFilterInput()}
          >
          </mwc-textfield>
        </abbr>
        ${this.renderCheckAll()}
      </div>
      <div style="display: flex; flex-direction: columns;">
        <mwc-list
          class="list info"
          style="flex: auto"
          .multi=${this.multi}
          .activatable=${this.activatable}
        >
          <slot></slot>
        </mwc-list>
        <mwc-list class="list primary"
          ><slot name="primaryAction"></slot
        ></mwc-list>
        <mwc-list class="list secondary"
          ><slot name="secondaryAction"></slot
        ></mwc-list>
      </div> `;
  }

  static styles = css`
    ${unsafeCSS(List.styles)}

    .search.container {
      display: flex;
      flex: auto;
    }

    ::slotted(.hidden) {
      display: none;
    }

    abbr {
      display: flex;
      flex: auto;
      margin: 8px;
      text-decoration: none;
      border-bottom: none;
    }

    mwc-textfield {
      width: 100%;
      --mdc-shape-small: 28px;
    }

    mwc-formfield.checkall {
      padding-right: 8px;
    }

    .mdc-list {
      padding-inline-start: 0px;
    }
  `;
}
