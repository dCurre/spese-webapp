import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ShoppingCategory, ShoppingItem } from 'src/app/core/services/postgres/shopping-list/shopping-list';

export interface ItemSavePayload { item: ShoppingItem; name: string; quantity: number | null; }
export interface ItemDeletePayload { item: ShoppingItem; }
export interface ItemTogglePayload { item: ShoppingItem; }
export interface CategoryTogglePayload { cat: ShoppingCategory; }
export interface CategoryDeletePayload { cat: ShoppingCategory; }
export interface CategoryRenameSave { cat: ShoppingCategory; name: string; }
export interface AddItemPayload { cat: ShoppingCategory; name: string; quantity: number; }
export interface AddSubcategoryPayload { parent: ShoppingCategory; name: string; }

@Component({
  selector: 'app-category-node',
  templateUrl: './category-node.component.html',
  styleUrls: ['./category-node.component.css'],
})
export class CategoryNodeComponent implements OnChanges {
  @Input() cat!: ShoppingCategory;
  @Input() depth = 0;

  // stati condivisi dal padre (uno alla volta globale)
  @Input() editingItemId: number | null = null;
  @Input() editingItemName = '';
  @Input() editingItemQty: number | null = null;
  @Input() savingEditId: number | null = null;
  @Input() deletingId: number | null = null;
  @Input() editingCategoryId: number | null = null;
  @Input() editingCategoryName = '';
  @Input() savingEditCategoryId: number | null = null;
  @Input() addingItemInCategoryId: number | null = null;
  @Input() newCategoryItemName = '';
  @Input() newCategoryItemQty: number = 1;
  @Input() savingItem = false;
  @Input() addingSubcategoryParentId: number | null = null;
  @Input() newSubcategoryName = '';
  @Input() savingCategory = false;

  // eventi verso il padre
  @Output() itemToggle = new EventEmitter<ItemTogglePayload>();
  @Output() itemSave = new EventEmitter<ItemSavePayload>();
  @Output() itemDelete = new EventEmitter<ItemDeletePayload>();
  @Output() itemEditStart = new EventEmitter<ShoppingItem>();
  @Output() itemEditCancel = new EventEmitter<void>();
  @Output() itemEditNameChange = new EventEmitter<string>();
  @Output() itemEditQtyChange = new EventEmitter<number | null>();
  @Output() categoryToggle = new EventEmitter<CategoryTogglePayload>();
  @Output() categoryDelete = new EventEmitter<CategoryDeletePayload>();
  @Output() categoryRenameStart = new EventEmitter<ShoppingCategory>();
  @Output() categoryRenameSave = new EventEmitter<CategoryRenameSave>();
  @Output() categoryRenameCancel = new EventEmitter<void>();
  @Output() categoryRenameNameChange = new EventEmitter<string>();
  @Output() addItemStart = new EventEmitter<number>(); // catId
  @Output() addItemCancel = new EventEmitter<void>();
  @Output() addItemSave = new EventEmitter<AddItemPayload>();
  @Output() addItemNameChange = new EventEmitter<string>();
  @Output() addItemQtyChange = new EventEmitter<number>();
  @Output() addSubcategoryStart = new EventEmitter<number>(); // parentId
  @Output() addSubcategoryCancel = new EventEmitter<void>();
  @Output() addSubcategorySave = new EventEmitter<AddSubcategoryPayload>();
  @Output() addSubcategoryNameChange = new EventEmitter<string>();

  protected collapsed = false;

  ngOnChanges(): void {}

  protected get indentPx(): number { return this.depth * 20; }

  protected get allItems(): ShoppingItem[] { return this.cat.items ?? []; }

  protected get checkedItemCount(): number { return this.allItems.filter(i => i.checked).length; }

  protected get checkedAll(): boolean {
    const items = this.allItems;
    const childChecked = (this.cat.children ?? []).every(c => this.subtreeChecked(c));
    return items.length + (this.cat.children?.length ?? 0) > 0
      && items.every(i => i.checked) && childChecked;
  }

  protected get indeterminate(): boolean {
    if (this.checkedAll) return false;
    const hasChecked = this.allItems.some(i => i.checked)
      || (this.cat.children ?? []).some(c => this.subtreeHasChecked(c));
    return hasChecked;
  }

  protected get progress(): number {
    const all = this.allItems;
    if (!all.length) return 0;
    return Math.round(all.filter(i => i.checked).length / all.length * 100);
  }

  protected get uncheckedItems(): ShoppingItem[] {
    return this.sortItems(this.allItems.filter(i => !i.checked));
  }

  protected get checkedItems(): ShoppingItem[] {
    return this.sortItems(this.allItems.filter(i => i.checked));
  }

  private sortItems(items: ShoppingItem[]): ShoppingItem[] {
    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
  }

  private subtreeChecked(cat: ShoppingCategory): boolean {
    const items = cat.items ?? [];
    const childOk = (cat.children ?? []).every(c => this.subtreeChecked(c));
    return items.length + (cat.children?.length ?? 0) > 0
      && items.every(i => i.checked) && childOk;
  }

  private subtreeHasChecked(cat: ShoppingCategory): boolean {
    return (cat.items ?? []).some(i => i.checked)
      || (cat.children ?? []).some(c => this.subtreeHasChecked(c));
  }

  protected onEditItemKeydown(event: KeyboardEvent, item: ShoppingItem): void {
    if (event.key === 'Enter') this.itemSave.emit({ item, name: this.editingItemName, quantity: this.editingItemQty });
    if (event.key === 'Escape') this.itemEditCancel.emit();
  }

  protected onEditCategoryKeydown(event: KeyboardEvent, cat: ShoppingCategory): void {
    if (event.key === 'Enter') this.categoryRenameSave.emit({ cat, name: this.editingCategoryName });
    if (event.key === 'Escape') this.categoryRenameCancel.emit();
  }

  protected onAddItemKeydown(event: KeyboardEvent, cat: ShoppingCategory): void {
    if (event.key === 'Enter') this.addItemSave.emit({ cat, name: this.newCategoryItemName, quantity: this.newCategoryItemQty });
    if (event.key === 'Escape') this.addItemCancel.emit();
  }

  protected onAddSubcategoryKeydown(event: KeyboardEvent, parent: ShoppingCategory): void {
    if (event.key === 'Enter') this.addSubcategorySave.emit({ parent, name: this.newSubcategoryName });
    if (event.key === 'Escape') this.addSubcategoryCancel.emit();
  }
}
