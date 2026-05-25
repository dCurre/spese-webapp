import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ShoppingList, ShoppingItem, ShoppingCategory, ShoppingListParticipant } from 'src/app/core/services/postgres/shopping-list/shopping-list';
import { ShoppingListService, ShoppingItemService, ShoppingCategoryService } from 'src/app/core/services/postgres/shopping-list/shopping-list.service';
import { ItemSavePayload, ItemDeletePayload, ItemTogglePayload, CategoryTogglePayload, CategoryDeletePayload, CategoryRenameSave, AddItemPayload, AddSubcategoryPayload } from './category-node/category-node.component';
import { ImportChecklistDialogComponent, ImportChecklistResult } from '../dialog/import-checklist-dialog/import-checklist-dialog.component';
import { User } from 'src/app/core/services/postgres/user/user';

@Component({
  selector: 'app-checklist-detail',
  templateUrl: './checklist-detail.component.html',
  styleUrls: ['./checklist-detail.component.css']
})
export class ChecklistDetailComponent implements OnInit, OnDestroy {
  protected list: ShoppingList | null = null;
  protected loggedUser: User | null = null;
  protected hasLoaded = false;
  protected loadError = false;

  // Aggiunta item in una categoria
  protected addingItemInCategoryId: number | null = null;
  protected newCategoryItemName = '';
  protected newCategoryItemQty: number = 1;

  // Nuova categoria (root)
  protected addingCategory = false;
  protected newCategoryName = '';
  protected savingCategory = false;

  // Nuova sottocategoria
  protected addingSubcategoryParentId: number | null = null;
  protected newSubcategoryName = '';
  protected savingItem = false;
  protected deletingId: number | null = null;
  protected savingEditId: number | null = null;
  protected savingEditCategoryId: number | null = null;

  // Categorie collapse
  protected collapsedCategories = new Set<number>();
  protected allCollapsed = false;

  protected toggleCollapseAll(): void {
    this.allCollapsed = !this.allCollapsed;
  }

  // Edit inline
  protected editingItemId: number | null = null;
  protected editingItemName = '';
  protected editingItemQty: number | null = null;
  protected editingItemCategoryId: number | null = null;  // categoria durante edit
  protected editingCategoryId: number | null = null;
  protected editingCategoryName = '';
  private editingCategoryOriginalName = '';

  protected shareCopied = false;
  protected editingName = false;
  protected editingNameValue = '';
  protected nameEditEmpty = false;

  protected batchMode = false;
  // batch categories
  protected batchCategories: { id: number | null; name: string; toDelete: boolean; depth: number; parentId: number | null; items: { id: number | null; name: string; quantity: number | null; checked: boolean; toDelete: boolean; categoryId: number | null }[] }[] = [];
  // batch uncategorized
  protected batchUncategorized: { id: number | null; name: string; quantity: number | null; checked: boolean; toDelete: boolean; categoryId: number | null }[] = [];
  protected batchAddAttempted = false;
  // legacy alias for template footer counter
  protected get batchItems(): { id: number | null; name: string; quantity: number | null; checked: boolean; toDelete: boolean; categoryId: number | null }[] {
    return [...this.batchCategories.flatMap(c => c.items), ...this.batchUncategorized];
  }

  protected sidebarOpen = false;
  protected showTransferModal = false;
  protected selectedNewOwnerId: number | null = null;
  protected showDeleteModal = false;

  private listId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private shoppingListService: ShoppingListService,
    private shoppingItemService: ShoppingItemService,
    private shoppingCategoryService: ShoppingCategoryService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.listId = Number(this.route.snapshot.paramMap.get('id'));
    this.authService.getUser().then(user => {
      this.loggedUser = user;
      this.loadList();
    });
  }

  ngOnDestroy(): void {}

  private loadList(): void {
    this.shoppingListService.getById(this.listId).subscribe({
      next: (list) => {
        this.list = list;
        this.hasLoaded = true;
        this.loadError = false;
      },
      error: () => { this.hasLoaded = true; this.loadError = true; }
    });
  }

  private reload(): void {
    this.shoppingListService.getById(this.listId).subscribe({
      next: (list) => {
        this.list = list;
      },
      error: () => {}
    });
  }

  // ── Helpers ────────────────────────────────────────────────────

  /** Ordinamento: checked prima, poi alfabetico */
  private sortItems(items: ShoppingItem[]): ShoppingItem[] {
    return [...items].sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
    });
  }

  protected get categories(): ShoppingCategory[] {
    return (this.list?.categories ?? []).sort((a, b) => a.sort_order - b.sort_order);
  }

  /** Lista piatta di tutte le categorie (incluse sottocategorie) con nome indentato */
  protected get flatCategories(): { id: number; label: string }[] {
    const result: { id: number; label: string }[] = [];
    const flatten = (cats: ShoppingCategory[], depth: number) => {
      for (const cat of cats) {
        result.push({ id: cat.id, label: '    '.repeat(depth) + cat.name });
        if (cat.children?.length) flatten(cat.children, depth + 1);
      }
    };
    flatten(this.categories, 0);
    return result;
  }

  /** Item senza categoria */
  protected get uncategorizedItems(): ShoppingItem[] {
    return this.sortItems(this.list?.items ?? []);
  }

  /** Categoria fittizia per la sezione "Senza categoria" */
  protected get uncategorizedNode(): ShoppingCategory {
    const node = new ShoppingCategory();
    node.id = 0;
    node.shopping_list_id = this.list?.id ?? 0;
    node.parent_id = null;
    node.name = 'Senza categoria';
    node.sort_order = 9999;
    node.created_at = '';
    node.items = this.uncategorizedItems;
    node.children = [];
    return node;
  }

  private get uncatAllChecked(): boolean {
    const items = this.uncategorizedItems;
    return items.length > 0 && items.every(i => i.checked);
  }

  protected toggleUncategorized(): void {
    const items = this.uncategorizedItems;
    if (!items.length || !this.list) return;
    const newChecked = !this.uncatAllChecked;
    this.shoppingItemService.checkAll(this.list.id, newChecked, true).subscribe({
      next: () => { items.forEach(i => i.checked = newChecked); this.syncCompletedState(); },
      error: () => {}
    });
  }

  /** Tutti gli item (categorie ricorsive + senza categoria) per progress e sync */
  private get allItems(): ShoppingItem[] {
    const collectItems = (cats: ShoppingCategory[]): ShoppingItem[] =>
      cats.flatMap(c => [...(c.items ?? []), ...collectItems(c.children ?? [])]);
    return [...collectItems(this.categories), ...(this.list?.items ?? [])];
  }

  protected get progressPercent(): number {
    const all = this.allItems;
    if (!all.length) return 0;
    return Math.round((all.filter(i => i.checked).length / all.length) * 100);
  }

  protected get checkedCount(): number { return this.allItems.filter(i => i.checked).length; }
  protected get totalCount(): number { return this.allItems.length; }
  protected get hasCheckedItems(): boolean { return this.allItems.some(i => i.checked); }
  protected get isOwner(): boolean { return this.list?.owner_id === this.loggedUser?.id; }

  protected isCategoryCollapsed(id: number): boolean { return this.collapsedCategories.has(id); }
  protected toggleCategoryCollapse(id: number): void {
    this.collapsedCategories.has(id) ? this.collapsedCategories.delete(id) : this.collapsedCategories.add(id);
  }

  protected categoryChecked(cat: ShoppingCategory): boolean {
    const total = this.subtreeItemCount(cat);
    if (!total) return false;
    return this.subtreeCheckedCount(cat) === total;
  }

  protected categoryIndeterminate(cat: ShoppingCategory): boolean {
    const checked = this.subtreeCheckedCount(cat);
    const total = this.subtreeItemCount(cat);
    return checked > 0 && checked < total;
  }

  private subtreeCheckedCount(cat: ShoppingCategory): number {
    return (cat.items ?? []).filter(i => i.checked).length
      + (cat.children ?? []).reduce((s, c) => s + this.subtreeCheckedCount(c), 0);
  }

  protected categoryProgress(cat: ShoppingCategory): number {
    const items = cat.items ?? [];
    if (!items.length) return 0;
    return Math.round((items.filter(i => i.checked).length / items.length) * 100);
  }

  protected uncheckedCatItems(cat: ShoppingCategory): ShoppingItem[] {
    return this.sortItems(cat.items ?? []).filter(i => !i.checked);
  }

  protected checkedCatItems(cat: ShoppingCategory): ShoppingItem[] {
    return this.sortItems(cat.items ?? []).filter(i => i.checked);
  }

  // ── Toggle categoria (spunta/despunta tutti gli item) ──────────

  protected toggleCategory(cat: ShoppingCategory): void {
    const totalItems = this.subtreeItemCount(cat);
    if (!totalItems) return;
    const newChecked = !this.categoryChecked(cat);
    this.shoppingCategoryService.checkCategory(cat.id, newChecked).subscribe({
      next: () => { this.setCheckedRecursive(cat, newChecked); this.syncCompletedState(); },
      error: () => {}
    });
  }

  private subtreeItemCount(cat: ShoppingCategory): number {
    return (cat.items ?? []).length + (cat.children ?? []).reduce((s, c) => s + this.subtreeItemCount(c), 0);
  }

  private setCheckedRecursive(cat: ShoppingCategory, checked: boolean): void {
    (cat.items ?? []).forEach(i => i.checked = checked);
    (cat.children ?? []).forEach(c => this.setCheckedRecursive(c, checked));
  }

  // ── Toggle item singolo ────────────────────────────────────────

  protected toggleItem(item: ShoppingItem): void {
    const newChecked = !item.checked;
    this.shoppingItemService.toggleChecked(item.id, newChecked).subscribe({
      next: () => { item.checked = newChecked; this.syncCompletedState(); },
      error: () => {}
    });
  }

  private syncCompletedState(): void {
    if (!this.list) return;
    const all = this.allItems;
    if (!all.length) return;
    const allChecked = all.every(i => i.checked);
    if (allChecked && !this.list.completed) {
      this.shoppingListService.update(this.list.id, { completed: true }).subscribe({
        next: () => { if (this.list) this.list.completed = true; }, error: () => {}
      });
    } else if (!allChecked && this.list.completed) {
      this.shoppingListService.update(this.list.id, { completed: false }).subscribe({
        next: () => { if (this.list) this.list.completed = false; }, error: () => {}
      });
    }
  }

  // ── Aggiungi categoria ─────────────────────────────────────────

  protected addCategory(): void {
    if (!this.newCategoryName.trim() || !this.list || this.savingCategory) return;
    this.savingCategory = true;
    this.shoppingCategoryService.create({
      shopping_list_id: this.list.id,
      name: this.newCategoryName.trim(),
      sort_order: this.categories.length,
    }).subscribe({
      next: () => { this.newCategoryName = ''; this.addingCategory = false; this.savingCategory = false; this.reload(); },
      error: () => { this.savingCategory = false; }
    });
  }

  protected onCategoryKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.addCategory();
    if (event.key === 'Escape') { this.addingCategory = false; this.newCategoryName = ''; }
  }

  // ── Aggiungi sottocategoria ────────────────────────────────────

  protected startAddSubcategory(parentId: number): void {
    this.addingSubcategoryParentId = parentId;
    this.newSubcategoryName = '';
    this.addingItemInCategoryId = null;
  }

  protected cancelAddSubcategory(): void {
    this.addingSubcategoryParentId = null;
    this.newSubcategoryName = '';
  }

  // ── Bridge: CategoryNodeComponent events → metodi esistenti ───────

  protected onNodeItemToggle(e: ItemTogglePayload): void { this.toggleItem(e.item); }

  protected onNodeItemSave(e: ItemSavePayload): void {
    this.editingItemName = e.name;
    this.editingItemQty = e.quantity;
    this.editingItemCategoryId = e.categoryId;
    this.saveEditItem(e.item);
  }

  protected onNodeItemDelete(e: ItemDeletePayload): void {
    if (this.deletingId) return;
    this.deletingId = e.item.id;
    this.shoppingItemService.delete(e.item.id).subscribe({
      next: () => { this.deletingId = null; this.reload(); },
      error: () => { this.deletingId = null; }
    });
  }

  protected onNodeItemEditStart(item: ShoppingItem): void { this.startEditItem(item); }

  protected onNodeCategoryToggle(e: CategoryTogglePayload): void {
    if (e.cat.id === 0) { this.toggleUncategorized(); return; }
    this.toggleCategory(e.cat);
  }

  protected onNodeCategoryDelete(e: CategoryDeletePayload): void {
    if (this.deletingId) return;
    this.deletingId = e.cat.id;
    this.shoppingCategoryService.delete(e.cat.id).subscribe({
      next: () => { this.deletingId = null; this.reload(); },
      error: () => { this.deletingId = null; }
    });
  }

  protected onNodeCategoryRenameStart(cat: ShoppingCategory): void {
    this.editingCategoryId = cat.id;
    this.editingCategoryName = cat.name;
    this.editingCategoryOriginalName = cat.name;
    this.editingItemId = null;
  }

  protected onNodeCategoryRenameSave(e: CategoryRenameSave): void {
    this.editingCategoryName = e.name;
    this.saveEditCategory(e.cat);
  }

  protected emptyingUncat = false;

  protected onNodeCategoryEmpty(e: CategoryDeletePayload): void {
    if (e.cat.id !== 0 || this.emptyingUncat) return;
    const items = this.uncategorizedItems;
    if (!items.length) return;
    this.emptyingUncat = true;
    let done = 0;
    items.forEach(i => this.shoppingItemService.delete(i.id).subscribe({
      next: () => { done++; if (done === items.length) { this.emptyingUncat = false; this.reload(); } },
      error: () => { done++; if (done === items.length) { this.emptyingUncat = false; this.reload(); } }
    }));
  }

  protected onNodeAddItemSave(e: AddItemPayload): void {
    this.newCategoryItemName = e.name;
    this.newCategoryItemQty = e.quantity;
    this.addItemInCategory(e.cat);
  }

  protected onNodeAddSubcategorySave(e: AddSubcategoryPayload): void {
    this.newSubcategoryName = e.name;
    this.addSubcategory(e.parent, e.name);
  }

  // ── Fine bridge ────────────────────────────────────────────────────

  protected addSubcategory(parent: ShoppingCategory, name: string): void {
    if (!name.trim() || !this.list || this.savingCategory) return;
    this.savingCategory = true;
    this.shoppingCategoryService.create({
      shopping_list_id: this.list.id,
      parent_id: parent.id,
      name: name.trim(),
      sort_order: (parent.children ?? []).length,
    }).subscribe({
      next: () => { this.savingCategory = false; this.cancelAddSubcategory(); this.reload(); },
      error: () => { this.savingCategory = false; }
    });
  }

  // ── Aggiungi item in categoria ─────────────────────────────────

  protected startAddItemInCategory(catId: number): void {
    if (catId === 0) { // sentinella "senza categoria"
      this.addingItemInCategoryId = 0;
      this.newCategoryItemName = '';
      this.newCategoryItemQty = 1;
      return;
    }
    this.addingItemInCategoryId = catId;
    this.newCategoryItemName = '';
    this.newCategoryItemQty = 1;
    this.collapsedCategories.delete(catId);
  }

  protected cancelAddItemInCategory(): void {
    this.addingItemInCategoryId = null;
    this.newCategoryItemName = '';
    this.newCategoryItemQty = 1;
  }

  protected addItemInCategory(cat: ShoppingCategory): void {
    if (!this.newCategoryItemName.trim() || !this.list || this.savingItem) return;
    this.savingItem = true;
    const categoryId = cat.id === 0 ? null : cat.id; // 0 = sentinella "senza categoria"
    this.shoppingItemService.create({
      shopping_list_id: this.list.id,
      category_id: categoryId,
      name: this.newCategoryItemName.trim(),
      quantity: this.newCategoryItemQty > 0 ? this.newCategoryItemQty : null,
      checked: false,
      sort_order: (cat.items ?? []).length,
    }).subscribe({
      next: () => { this.savingItem = false; this.cancelAddItemInCategory(); this.newCategoryItemQty = 1; this.reload(); },
      error: () => { this.savingItem = false; }
    });
  }

  protected onCategoryItemKeydown(event: KeyboardEvent, cat: ShoppingCategory): void {
    if (event.key === 'Enter') this.addItemInCategory(cat);
    if (event.key === 'Escape') this.cancelAddItemInCategory();
  }

  // ── Aggiungi item senza categoria ──────────────────────────────

  // ── Delete ─────────────────────────────────────────────────────

  protected deleteItem(item: ShoppingItem, event: Event): void {
    event.stopPropagation();
    if (this.deletingId) return;
    this.deletingId = item.id;
    this.shoppingItemService.delete(item.id).subscribe({
      next: () => { this.deletingId = null; this.reload(); },
      error: () => { this.deletingId = null; }
    });
  }

  protected deleteCategory(cat: ShoppingCategory, event: Event): void {
    event.stopPropagation();
    if (this.deletingId) return;
    this.deletingId = cat.id;
    this.shoppingCategoryService.delete(cat.id).subscribe({
      next: () => { this.deletingId = null; this.reload(); },
      error: () => { this.deletingId = null; }
    });
  }

  // ── Edit inline item ───────────────────────────────────────────

  protected startEditItem(item: ShoppingItem): void {
    this.editingItemId = item.id;
    this.editingItemName = item.name;
    this.editingItemQty = item.quantity ?? null;
    this.editingItemCategoryId = item.category_id ?? null;
    this.editingCategoryId = null;
  }

  protected saveEditItem(item: ShoppingItem): void {
    if (!this.editingItemName.trim() || this.savingEditId) return;
    this.savingEditId = item.id;
    const qty = (this.editingItemQty && this.editingItemQty > 0) ? this.editingItemQty : null;
    const catId = this.editingItemCategoryId;
    this.shoppingItemService.update(item.id, { name: this.editingItemName.trim(), quantity: qty, category_id: catId }).subscribe({
      next: () => { this.savingEditId = null; this.cancelEditItem(); this.reload(); },
      error: () => { this.savingEditId = null; this.cancelEditItem(); }
    });
  }

  protected cancelEditItem(): void { this.editingItemId = null; this.editingItemName = ''; this.editingItemQty = null; this.editingItemCategoryId = null; }

  protected onEditItemKeydown(event: KeyboardEvent, item: ShoppingItem): void {
    if (event.key === 'Enter') this.saveEditItem(item);
    if (event.key === 'Escape') this.cancelEditItem();
  }

  // ── Edit inline categoria ──────────────────────────────────────

  protected startEditCategory(cat: ShoppingCategory, event: Event): void {
    event.stopPropagation();
    this.editingCategoryId = cat.id;
    this.editingCategoryName = cat.name;
    this.editingCategoryOriginalName = cat.name;
    this.editingItemId = null;
  }

  protected saveEditCategory(cat: ShoppingCategory): void {
    if (!this.editingCategoryName.trim()) { this.cancelEditCategory(); return; }
    if (this.editingCategoryName.trim() === this.editingCategoryOriginalName) { this.cancelEditCategory(); return; }
    if (this.savingEditCategoryId) return;
    this.savingEditCategoryId = cat.id;
    this.shoppingCategoryService.update(cat.id, { name: this.editingCategoryName.trim() }).subscribe({
      next: () => { cat.name = this.editingCategoryName.trim(); this.savingEditCategoryId = null; this.cancelEditCategory(); },
      error: () => { this.savingEditCategoryId = null; this.cancelEditCategory(); }
    });
  }

  protected cancelEditCategory(): void { this.editingCategoryId = null; this.editingCategoryName = ''; }

  protected onEditCategoryKeydown(event: KeyboardEvent, cat: ShoppingCategory): void {
    if (event.key === 'Enter') this.saveEditCategory(cat);
    if (event.key === 'Escape') this.cancelEditCategory();
  }

  // ── Edit nome lista ────────────────────────────────────────────

  protected startEditName(): void {
    if (!this.list || !this.isOwner) return;
    this.editingNameValue = this.list.name;
    this.editingName = true;
  }

  protected saveEditName(): void {
    if (!this.editingNameValue.trim()) { this.nameEditEmpty = true; return; }
    this.nameEditEmpty = false;
    if (!this.list) { this.cancelEditName(); return; }
    const newName = this.editingNameValue.trim();
    if (newName === this.list.name) { this.cancelEditName(); return; }
    this.shoppingListService.update(this.list.id, { name: newName }).subscribe({
      next: () => { if (this.list) this.list.name = newName; this.cancelEditName(); },
      error: () => this.cancelEditName()
    });
  }

  protected cancelEditName(): void { this.editingName = false; this.editingNameValue = ''; this.nameEditEmpty = false; }

  protected onNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.saveEditName();
    if (event.key === 'Escape') this.cancelEditName();
  }

  // ── Star / Complete / Uncheck ──────────────────────────────────

  protected toggleStar(): void {
    if (!this.list) return;
    const newVal = !this.list.starred;
    this.shoppingListService.toggleStar(this.list.id, newVal).subscribe({
      next: () => { if (this.list) this.list.starred = newVal; }, error: () => {}
    });
  }

  protected toggleCompleted(): void {
    if (!this.list) return;
    const newVal = !this.list.completed;
    const first$ = newVal ? this.shoppingItemService.checkAll(this.list.id, true) : of(undefined);
    first$.pipe(switchMap(() => this.shoppingListService.update(this.list!.id, { completed: newVal }))).subscribe({
      next: () => {
        if (this.list) {
          this.list.completed = newVal;
          if (newVal) this.allItems.forEach(i => i.checked = true);
        }
      },
      error: () => {}
    });
  }

  protected uncheckAll(): void {
    if (!this.list) return;
    this.shoppingItemService.checkAll(this.list.id, false).subscribe({
      next: () => {
        this.allItems.forEach(i => i.checked = false);
        this.shoppingListService.update(this.list!.id, { completed: false }).subscribe({
          next: () => { if (this.list) this.list.completed = false; }, error: () => {}
        });
      },
      error: () => {}
    });
  }

  // ── Batch mode ────────────────────────────────────────────────

  protected get batchDeleteCount(): number {
    const cats = this.batchCategories.filter(c => c.id !== null && c.toDelete).length;
    const items = this.batchItems.filter(i => i.id !== null && i.toDelete).length;
    return cats + items;
  }
  protected get hasEmptyBatchItem(): boolean {
    return this.batchItems.some(i => i.id === null && !i.name.trim());
  }

  protected enterBatchMode(): void {
    const flattenCats = (cats: ShoppingCategory[], depth: number, parentId: number | null): typeof this.batchCategories => {
      return cats.flatMap(cat => [
        {
          id: cat.id,
          name: cat.name,
          toDelete: false,
          depth,
          parentId,
          items: (cat.items ?? []).sort((a, b) => a.sort_order - b.sort_order).map(i => ({
            id: i.id, name: i.name, quantity: i.quantity ?? null, checked: i.checked, toDelete: false, categoryId: cat.id,
          })),
        },
        ...flattenCats(cat.children ?? [], depth + 1, cat.id),
      ]);
    };
    this.batchCategories = flattenCats(this.categories, 0, null);
    this.batchUncategorized = this.uncategorizedItems.map(i => ({
      id: i.id, name: i.name, quantity: i.quantity ?? null, checked: i.checked, toDelete: false, categoryId: null,
    }));
    this.batchMode = true;
  }

  protected cancelBatch(): void {
    this.batchMode = false;
    this.batchCategories = [];
    this.batchUncategorized = [];
  }

  protected toggleBatchDelete(item: any): void { item.toDelete = !item.toDelete; }

  protected toggleBatchCategoryDelete(cat: any): void {
    cat.toDelete = !cat.toDelete;
    // marca/demarks anche tutti i suoi item
    cat.items.forEach((i: any) => i.toDelete = cat.toDelete);
  }

  protected removeBatchItem(item: any, list: any[]): void {
    const idx = list.indexOf(item);
    if (idx !== -1) list.splice(idx, 1);
  }

  protected addBatchItem(list: any[], categoryId: number | null = null): void {
    if (this.hasEmptyBatchItem) { this.batchAddAttempted = true; return; }
    this.batchAddAttempted = false;
    list.push({ id: null, name: '', quantity: 1, checked: false, toDelete: false, categoryId });
  }

  protected addBatchCategory(): void {
    this.batchCategories.push({ id: null, name: '', toDelete: false, depth: 0, parentId: null, items: [] });
  }

  /** Aggiunge una nuova sottocategoria subito dopo il blocco del parent */
  protected addBatchSubcategory(parentCat: typeof this.batchCategories[0]): void {
    const parentIdx = this.batchCategories.indexOf(parentCat);
    if (parentIdx === -1) return;
    // Trova la posizione subito dopo l'ultimo discendente del parent
    let insertIdx = parentIdx + 1;
    while (insertIdx < this.batchCategories.length && this.batchCategories[insertIdx].depth > parentCat.depth) {
      insertIdx++;
    }
    this.batchCategories.splice(insertIdx, 0, {
      id: null,
      name: '',
      toDelete: false,
      depth: parentCat.depth + 1,
      parentId: parentCat.id,   // null se il parent è anch'esso nuovo
      items: [],
    });
  }

  protected removeBatchCategory(cat: any): void {
    const idx = this.batchCategories.indexOf(cat);
    if (idx !== -1) this.batchCategories.splice(idx, 1);
  }

  protected saveBatch(): void {
    if (!this.list) return;

    const categories_update: { id: number; name: string }[] = [];
    const categories_delete: number[] = [];
    const categories_create: { temp_id: string; name: string; parent_id: number | string | null; sort_order: number }[] = [];
    const items_update: { id: number; name: string; quantity: number | null; checked: boolean; category_id?: number | null }[] = [];
    const items_delete: number[] = [];
    const items_create: { name: string; quantity: number | null; checked: boolean; sort_order: number; category_id: number | null; category_temp_id?: string }[] = [];

    // Assegna temp_id alle nuove categorie per poterle referenziare
    let tempCounter = 0;
    const catTempIds = new Map<typeof this.batchCategories[0], string>();
    this.batchCategories.forEach(cat => {
      if (cat.id === null) catTempIds.set(cat, `t${++tempCounter}`);
    });

    /** Normalizza: quantity ≤ 0 o null → null, altrimenti il valore numerico */
    const normQty = (q: number | null): number | null => (q && q > 0) ? q : null;

    // Categorie
    this.batchCategories.forEach((cat, catIdx) => {
      if (cat.id !== null && cat.toDelete) {
        categories_delete.push(cat.id);
        return;
      }
      if (cat.id !== null && !cat.toDelete) {
        if (cat.name.trim()) categories_update.push({ id: cat.id, name: cat.name.trim() });
        cat.items.forEach((item, idx) => {
          if (item.id !== null && item.toDelete) { items_delete.push(item.id); return; }
          if (item.id !== null) items_update.push({ id: item.id, name: item.name.trim() || 'Articolo', quantity: normQty(item.quantity), checked: item.checked, category_id: item.categoryId });
          if (item.id === null && item.name.trim()) items_create.push({
            name: item.name.trim(), quantity: normQty(item.quantity), checked: item.checked,
            sort_order: idx, category_id: item.categoryId,
          });
        });
      }
      if (cat.id === null && cat.name.trim()) {
        const tempId = catTempIds.get(cat)!;
        // Controlla se parentId punta a una categoria nuova (id === null, già in catTempIds)
        const parentBatchCat = cat.parentId === null
          ? null
          : this.batchCategories.find(c => c.id === cat.parentId);
        // Se il parent esiste ma è marcato toDelete, salta: non creare la sottocategoria
        if (parentBatchCat && parentBatchCat.toDelete) return;
        // se il parent è nel batch ed è nuovo, usa il suo temp_id
        const parentNew = parentBatchCat && parentBatchCat.id === null ? catTempIds.get(parentBatchCat) : undefined;

        categories_create.push({
          temp_id: tempId,
          name: cat.name.trim(),
          parent_id: parentNew ?? cat.parentId,
          sort_order: catIdx,
        });
        cat.items.forEach((item, idx) => {
          if (!item.name.trim()) return;
          // Se l'item ha un categoryId esplicito (spostato), usalo; altrimenti usa il temp_id della nuova categoria
          if (item.categoryId !== null && item.categoryId !== undefined) {
            items_create.push({ name: item.name.trim(), quantity: normQty(item.quantity), checked: item.checked, sort_order: idx, category_id: item.categoryId });
          } else {
            items_create.push({ name: item.name.trim(), quantity: normQty(item.quantity), checked: item.checked, sort_order: idx, category_id: null, category_temp_id: tempId });
          }
        });
      }
    });

    // Item senza categoria
    this.batchUncategorized.forEach((item, idx) => {
      if (item.id !== null && item.toDelete) { items_delete.push(item.id); return; }
      if (item.id !== null) items_update.push({ id: item.id, name: item.name.trim() || 'Articolo', quantity: normQty(item.quantity), checked: item.checked, category_id: item.categoryId });
      if (item.id === null && item.name.trim()) items_create.push({
        name: item.name.trim(), quantity: normQty(item.quantity), checked: item.checked,
        sort_order: idx, category_id: item.categoryId,
      });
    });

    this.shoppingListService.batchSave(this.list.id, {
      categories_update,
      categories_delete,
      categories_create,
      items_update,
      items_delete,
      items_create,
    }).subscribe({
      next: () => { this.batchMode = false; this.batchCategories = []; this.batchUncategorized = []; this.reload(); },
      error: () => { /* toast già gestito dall'interceptor */ }
    });
  }

  // ── Import ────────────────────────────────────────────────────

  protected importItems(): void {
    if (!this.list) return;
    const modal = this.modalService.open(ImportChecklistDialogComponent, { centered: true, size: 'lg' });
    modal.componentInstance.mode = 'add';
    modal.result.then((result: ImportChecklistResult | null) => {
      if (!result || result.items.length === 0) return;
      this.shoppingListService.batchSave(this.list!.id, {
        items_create: result.items.map((item, idx) => ({
          name: item.name,
          quantity: null,
          checked: item.checked,
          sort_order: idx,
          category_id: null,
        })),
      }).subscribe({
        next: () => this.reload(),
        error: () => {},
      });
    }).catch(() => {});
  }

  // ── Share / Leave / Delete ─────────────────────────────────────

  protected shareList(): void {
    if (!this.list) return;
    if (this.list.invite_token) { this.copyLink(this.list.invite_token); return; }
    this.shoppingListService.generateInviteToken(this.list.id).subscribe({
      next: (res) => { if (this.list) this.list.invite_token = res.invite_token; this.copyLink(res.invite_token); },
      error: () => {}
    });
  }

  private copyLink(token: string): void {
    navigator.clipboard.writeText(`${window.location.origin}/checklist/join/${token}`).then(() => {
      this.shareCopied = true;
      setTimeout(() => this.shareCopied = false, 2000);
    });
  }

  protected get isParticipant(): boolean {
    return this.list?.participants?.some(p => p.user_id === this.loggedUser?.id) ?? false;
  }

  protected leaveList(): void {
    if (!this.list || !this.loggedUser) return;
    if (this.isOwner) { this.selectedNewOwnerId = null; this.showTransferModal = true; return; }
    this.shoppingListService.removeParticipant(this.list.id, this.loggedUser.id).subscribe({
      next: () => this.router.navigate(['/checklist']), error: () => {}
    });
  }

  protected get transferCandidates(): ShoppingListParticipant[] {
    return this.list?.participants?.filter(p => p.user_id !== this.list!.owner_id) ?? [];
  }

  protected confirmTransfer(): void {
    if (!this.list || !this.loggedUser || !this.selectedNewOwnerId) return;
    this.shoppingListService.transferOwnership(this.list.id, this.loggedUser.id, this.selectedNewOwnerId).subscribe({
      next: () => this.router.navigate(['/checklist']), error: () => {}
    });
  }

  protected cancelTransfer(): void { this.showTransferModal = false; this.selectedNewOwnerId = null; }
  protected deleteAndLeave(): void {
    this.shoppingListService.delete(this.list!.id).subscribe({
      next: () => this.router.navigate(['/checklist']), error: () => {}
    });
  }

  protected deleteList(): void { this.showDeleteModal = true; }
  protected cancelDelete(): void { this.showDeleteModal = false; }
  protected confirmDelete(): void {
    this.shoppingListService.delete(this.list!.id).subscribe({
      next: () => this.router.navigate(['/checklist']), error: () => {}
    });
  }

  // ── Utils ──────────────────────────────────────────────────────

  protected goBack(): void { this.router.navigate(['/checklist']); }
  protected toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  protected get participantCount(): number { return this.list?.participants?.length ?? 0; }

  protected get sortedParticipants(): ShoppingListParticipant[] {
    return [...(this.list?.participants ?? [])].sort((a, b) => {
      if (a.user_id === this.list!.owner_id) return -1;
      if (b.user_id === this.list!.owner_id) return 1;
      return 0;
    });
  }

  protected getInitials(p: ShoppingListParticipant): string {
    return `${p.name?.[0] ?? ''}${p.surname?.[0] ?? ''}`.toUpperCase() || '?';
  }

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
