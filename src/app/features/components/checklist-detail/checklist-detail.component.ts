import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ShoppingList, ShoppingItem, ShoppingCategory, ShoppingListParticipant } from 'src/app/core/services/postgres/shopping-list/shopping-list';
import { ShoppingListService, ShoppingItemService, ShoppingCategoryService } from 'src/app/core/services/postgres/shopping-list/shopping-list.service';
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

  // Aggiunta item (senza categoria)
  protected newItemName = '';
  protected newItemQty: number | null = null;
  protected addingItem = false;

  // Aggiunta item in una categoria
  protected addingItemInCategoryId: number | null = null;
  protected newCategoryItemName = '';
  protected newCategoryItemQty: number | null = null;

  // Nuova categoria
  protected addingCategory = false;
  protected newCategoryName = '';

  // Categorie collapse
  protected collapsedCategories = new Set<number>();

  // Edit inline
  protected editingItemId: number | null = null;
  protected editingItemName = '';
  protected editingCategoryId: number | null = null;
  protected editingCategoryName = '';

  protected shareCopied = false;
  protected editingName = false;
  protected editingNameValue = '';
  protected nameEditEmpty = false;

  protected batchMode = false;
  protected batchItems: { id: number | null; name: string; quantity: number | null; checked: boolean; toDelete: boolean }[] = [];
  protected batchAddAttempted = false;

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
      next: (list) => { this.list = list; this.hasLoaded = true; this.loadError = false; },
      error: () => { this.hasLoaded = true; this.loadError = true; }
    });
  }

  private reload(): void {
    this.shoppingListService.getById(this.listId).subscribe({
      next: (list) => { this.list = list; },
      error: () => {}
    });
  }

  // ── Helpers ────────────────────────────────────────────────────

  protected get categories(): ShoppingCategory[] {
    return (this.list?.categories ?? []).sort((a, b) => a.sort_order - b.sort_order);
  }

  /** Item senza categoria */
  protected get uncategorizedItems(): ShoppingItem[] {
    return (this.list?.items ?? []).sort((a, b) => a.sort_order - b.sort_order);
  }

  protected get uncheckedUncategorized(): ShoppingItem[] {
    return this.uncategorizedItems.filter(i => !i.checked);
  }

  protected get checkedUncategorized(): ShoppingItem[] {
    return this.uncategorizedItems.filter(i => i.checked);
  }

  /** Tutti gli item (categorie + senza categoria) per progress e sync */
  private get allItems(): ShoppingItem[] {
    const catItems = this.categories.flatMap(c => c.items ?? []);
    return [...catItems, ...(this.list?.items ?? [])];
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
    const items = cat.items ?? [];
    return items.length > 0 && items.every(i => i.checked);
  }

  protected categoryIndeterminate(cat: ShoppingCategory): boolean {
    const items = cat.items ?? [];
    const checked = items.filter(i => i.checked).length;
    return checked > 0 && checked < items.length;
  }

  protected categoryProgress(cat: ShoppingCategory): number {
    const items = cat.items ?? [];
    if (!items.length) return 0;
    return Math.round((items.filter(i => i.checked).length / items.length) * 100);
  }

  protected uncheckedCatItems(cat: ShoppingCategory): ShoppingItem[] {
    return (cat.items ?? []).filter(i => !i.checked).sort((a, b) => a.sort_order - b.sort_order);
  }

  protected checkedCatItems(cat: ShoppingCategory): ShoppingItem[] {
    return (cat.items ?? []).filter(i => i.checked).sort((a, b) => a.sort_order - b.sort_order);
  }

  // ── Toggle categoria (spunta/despunta tutti gli item) ──────────

  protected toggleCategory(cat: ShoppingCategory): void {
    const newChecked = !this.categoryChecked(cat);
    this.shoppingCategoryService.checkCategory(cat.id, newChecked).subscribe({
      next: () => {
        (cat.items ?? []).forEach(i => i.checked = newChecked);
        this.syncCompletedState();
      },
      error: () => {}
    });
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
    if (!this.newCategoryName.trim() || !this.list) return;
    this.shoppingCategoryService.create({
      shopping_list_id: this.list.id,
      name: this.newCategoryName.trim(),
      sort_order: this.categories.length,
    }).subscribe({
      next: () => { this.newCategoryName = ''; this.addingCategory = false; this.reload(); },
      error: () => {}
    });
  }

  protected onCategoryKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.addCategory();
    if (event.key === 'Escape') { this.addingCategory = false; this.newCategoryName = ''; }
  }

  // ── Aggiungi item in categoria ─────────────────────────────────

  protected startAddItemInCategory(catId: number): void {
    this.addingItemInCategoryId = catId;
    this.newCategoryItemName = '';
    this.newCategoryItemQty = null;
    this.collapsedCategories.delete(catId);
  }

  protected cancelAddItemInCategory(): void {
    this.addingItemInCategoryId = null;
    this.newCategoryItemName = '';
    this.newCategoryItemQty = null;
  }

  protected addItemInCategory(cat: ShoppingCategory): void {
    if (!this.newCategoryItemName.trim() || !this.list) return;
    this.shoppingItemService.create({
      shopping_list_id: this.list.id,
      category_id: cat.id,
      name: this.newCategoryItemName.trim(),
      quantity: this.newCategoryItemQty || null,
      checked: false,
      sort_order: (cat.items ?? []).length,
    }).subscribe({
      next: () => { this.cancelAddItemInCategory(); this.reload(); },
      error: () => {}
    });
  }

  protected onCategoryItemKeydown(event: KeyboardEvent, cat: ShoppingCategory): void {
    if (event.key === 'Enter') this.addItemInCategory(cat);
    if (event.key === 'Escape') this.cancelAddItemInCategory();
  }

  // ── Aggiungi item senza categoria ──────────────────────────────

  protected addItem(): void {
    if (!this.newItemName.trim() || !this.list) return;
    this.shoppingItemService.create({
      shopping_list_id: this.list.id,
      category_id: null,
      name: this.newItemName.trim(),
      quantity: this.newItemQty || null,
      checked: false,
      sort_order: this.uncategorizedItems.length,
    }).subscribe({
      next: () => { this.newItemName = ''; this.newItemQty = null; this.addingItem = false; this.reload(); },
      error: () => {}
    });
  }

  protected onAddKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.addItem();
    if (event.key === 'Escape') { this.addingItem = false; this.newItemName = ''; }
  }

  // ── Delete ─────────────────────────────────────────────────────

  protected deleteItem(item: ShoppingItem, event: Event): void {
    event.stopPropagation();
    this.shoppingItemService.delete(item.id).subscribe({
      next: () => this.reload(), error: () => {}
    });
  }

  protected deleteCategory(cat: ShoppingCategory, event: Event): void {
    event.stopPropagation();
    this.shoppingCategoryService.delete(cat.id).subscribe({
      next: () => this.reload(), error: () => {}
    });
  }

  // ── Edit inline item ───────────────────────────────────────────

  protected startEditItem(item: ShoppingItem): void {
    this.editingItemId = item.id;
    this.editingItemName = item.name;
    this.editingCategoryId = null;
  }

  protected saveEditItem(item: ShoppingItem): void {
    if (!this.editingItemName.trim()) { this.cancelEditItem(); return; }
    this.shoppingItemService.update(item.id, { name: this.editingItemName.trim() }).subscribe({
      next: () => { item.name = this.editingItemName.trim(); this.cancelEditItem(); },
      error: () => this.cancelEditItem()
    });
  }

  protected cancelEditItem(): void { this.editingItemId = null; this.editingItemName = ''; }

  protected onEditItemKeydown(event: KeyboardEvent, item: ShoppingItem): void {
    if (event.key === 'Enter') this.saveEditItem(item);
    if (event.key === 'Escape') this.cancelEditItem();
  }

  // ── Edit inline categoria ──────────────────────────────────────

  protected startEditCategory(cat: ShoppingCategory, event: Event): void {
    event.stopPropagation();
    this.editingCategoryId = cat.id;
    this.editingCategoryName = cat.name;
    this.editingItemId = null;
  }

  protected saveEditCategory(cat: ShoppingCategory): void {
    if (!this.editingCategoryName.trim()) { this.cancelEditCategory(); return; }
    this.shoppingCategoryService.update(cat.id, { name: this.editingCategoryName.trim() }).subscribe({
      next: () => { cat.name = this.editingCategoryName.trim(); this.cancelEditCategory(); },
      error: () => this.cancelEditCategory()
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

  // ── Batch mode (solo item senza categoria) ─────────────────────

  protected get batchDeleteCount(): number { return this.batchItems.filter(i => i.id !== null && i.toDelete).length; }
  protected get hasEmptyBatchItem(): boolean { return this.batchItems.some(i => i.id === null && !i.name.trim()); }

  protected enterBatchMode(): void {
    this.batchItems = this.uncategorizedItems.map(i => ({
      id: i.id, name: i.name, quantity: i.quantity ?? null, checked: i.checked, toDelete: false,
    }));
    this.batchMode = true;
  }

  protected cancelBatch(): void { this.batchMode = false; this.batchItems = []; }

  protected toggleBatchDelete(item: any): void { item.toDelete = !item.toDelete; }
  protected removeBatchItem(item: any): void { this.batchItems = this.batchItems.filter(i => i !== item); }

  protected addBatchItem(): void {
    if (this.hasEmptyBatchItem) { this.batchAddAttempted = true; return; }
    this.batchAddAttempted = false;
    this.batchItems.push({ id: null, name: '', quantity: null, checked: false, toDelete: false });
  }

  protected saveBatch(): void {
    const deleteIds = this.batchItems.filter(i => i.id !== null && i.toDelete).map(i => i.id as number);
    const updates = this.batchItems.filter(i => i.id !== null && !i.toDelete)
      .map(i => ({ id: i.id as number, name: i.name.trim() || 'Articolo', quantity: i.quantity, checked: i.checked }));
    const newItems = this.batchItems.filter(i => i.id === null && !i.toDelete && i.name.trim())
      .map((i, idx) => ({
        shopping_list_id: this.list!.id, category_id: null,
        name: i.name.trim(), quantity: i.quantity, checked: i.checked,
        sort_order: this.uncategorizedItems.length + idx,
      }));
    this.shoppingItemService.bulkUpdate(updates, deleteIds).subscribe({
      next: () => {
        if (!newItems.length) { this.batchMode = false; this.batchItems = []; this.reload(); return; }
        let done = 0;
        newItems.forEach(item => this.shoppingItemService.create(item).subscribe({
          next: () => { if (++done === newItems.length) { this.batchMode = false; this.batchItems = []; this.reload(); } },
          error: () => {}
        }));
      },
      error: () => {}
    });
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
