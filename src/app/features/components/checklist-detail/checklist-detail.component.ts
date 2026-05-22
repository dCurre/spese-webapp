import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ShoppingList, ShoppingItem, ShoppingListParticipant } from 'src/app/core/services/postgres/shopping-list/shopping-list';
import { ShoppingListService, ShoppingItemService } from 'src/app/core/services/postgres/shopping-list/shopping-list.service';
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
  protected newItemName = '';
  protected newItemQty: number | null = null;
  protected addingItem = false;
  protected editingItemId: number | null = null;
  protected editingItemName = '';

  protected shareCopied = false;

  protected editingName = false;
  protected editingNameValue = '';

  protected batchMode = false;
  protected batchItems: { id: number | null; name: string; quantity: number | null; checked: boolean; toDelete: boolean }[] = [];

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
      error: () => {
        this.hasLoaded = true;
        this.loadError = true;
      }
    });
  }

  private reload(): void {
    this.shoppingListService.getById(this.listId).subscribe({
      next: (list) => { this.list = list; },
      error: () => {}
    });
  }

  protected get items(): ShoppingItem[] {
    return this.list?.items ?? [];
  }

  protected get uncheckedItems(): ShoppingItem[] {
    return this.items.filter(i => !i.checked).sort((a, b) => a.sort_order - b.sort_order);
  }

  protected get checkedItems(): ShoppingItem[] {
    return this.items.filter(i => i.checked).sort((a, b) => a.sort_order - b.sort_order);
  }

  protected get progressPercent(): number {
    if (this.items.length === 0) return 0;
    return Math.round((this.checkedItems.length / this.items.length) * 100);
  }

  protected get isOwner(): boolean {
    return this.list?.owner_id === this.loggedUser?.id;
  }

  protected addItem(): void {
    if (!this.newItemName.trim() || !this.list) return;
    this.shoppingItemService.create({
      shopping_list_id: this.list.id,
      name: this.newItemName.trim(),
      quantity: this.newItemQty || 1,
      checked: false,
      sort_order: this.items.length,
    }).subscribe({
      next: () => {
        this.newItemName = '';
        this.newItemQty = null;
        this.addingItem = false;
        this.reload();
      },
      error: () => {}
    });
  }

  protected toggleItem(item: ShoppingItem): void {
    const newChecked = !item.checked;
    this.shoppingItemService.toggleChecked(item.id, newChecked).subscribe({
      next: () => {
        item.checked = newChecked;
        this.syncCompletedState();
      },
      error: () => {}
    });
  }

  private syncCompletedState(): void {
    if (!this.list || this.items.length === 0) return;
    const allChecked = this.items.every(i => i.checked);
    if (allChecked && !this.list.completed) {
      this.shoppingListService.update(this.list.id, { completed: true }).subscribe({
        next: () => { if (this.list) this.list.completed = true; },
        error: () => {}
      });
    } else if (!allChecked && this.list.completed) {
      this.shoppingListService.update(this.list.id, { completed: false }).subscribe({
        next: () => { if (this.list) this.list.completed = false; },
        error: () => {}
      });
    }
  }

  protected deleteItem(item: ShoppingItem, event: Event): void {
    event.stopPropagation();
    this.shoppingItemService.delete(item.id).subscribe({
      next: () => this.reload(),
      error: () => {}
    });
  }

  protected startEdit(item: ShoppingItem): void {
    this.editingItemId = item.id;
    this.editingItemName = item.name;
  }

  protected saveEdit(item: ShoppingItem): void {
    if (!this.editingItemName.trim()) {
      this.cancelEdit();
      return;
    }
    this.shoppingItemService.update(item.id, { name: this.editingItemName.trim() }).subscribe({
      next: () => {
        item.name = this.editingItemName.trim();
        this.cancelEdit();
      },
      error: () => this.cancelEdit()
    });
  }

  protected cancelEdit(): void {
    this.editingItemId = null;
    this.editingItemName = '';
  }

  protected startEditName(): void {
    if (!this.list || !this.isOwner) return;
    this.editingNameValue = this.list.name;
    this.editingName = true;
  }

  protected nameEditEmpty = false;

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

  protected cancelEditName(): void {
    this.editingName = false;
    this.editingNameValue = '';
    this.nameEditEmpty = false;
  }

  protected onNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.saveEditName();
    if (event.key === 'Escape') this.cancelEditName();
  }

  protected get isParticipant(): boolean {
    if (!this.list || !this.loggedUser) return false;
    return this.list.participants?.some(p => p.user_id === this.loggedUser!.id) ?? false;
  }

  protected leaveList(): void {
    if (!this.list || !this.loggedUser) return;
    if (this.isOwner) {
      this.selectedNewOwnerId = null;
      this.showTransferModal = true;
      return;
    }
    this.shoppingListService.removeParticipant(this.list.id, this.loggedUser.id).subscribe({
      next: () => this.router.navigate(['/checklist']),
      error: () => {}
    });
  }

  protected get transferCandidates(): ShoppingListParticipant[] {
    if (!this.list?.participants) return [];
    return this.list.participants.filter(p => p.user_id !== this.list!.owner_id);
  }

  protected confirmTransfer(): void {
    if (!this.list || !this.loggedUser || !this.selectedNewOwnerId) return;
    this.shoppingListService.transferOwnership(this.list.id, this.loggedUser.id, this.selectedNewOwnerId).subscribe({
      next: () => this.router.navigate(['/checklist']),
      error: () => {}
    });
  }

  protected cancelTransfer(): void {
    this.showTransferModal = false;
    this.selectedNewOwnerId = null;
  }

  protected deleteAndLeave(): void {
    if (!this.list) return;
    this.shoppingListService.delete(this.list.id).subscribe({
      next: () => this.router.navigate(['/checklist']),
      error: () => {}
    });
  }

  protected deleteList(): void {
    this.showDeleteModal = true;
  }

  protected cancelDelete(): void {
    this.showDeleteModal = false;
  }

  protected confirmDelete(): void {
    if (!this.list) return;
    this.shoppingListService.delete(this.list.id).subscribe({
      next: () => this.router.navigate(['/checklist']),
      error: () => {}
    });
  }

  protected shareList(): void {
    if (!this.list) return;
    if (this.list.invite_token) {
      this.copyLink(this.list.invite_token);
      return;
    }
    this.shoppingListService.generateInviteToken(this.list.id).subscribe({
      next: (res) => {
        if (this.list) this.list.invite_token = res.invite_token;
        this.copyLink(res.invite_token);
      },
      error: () => {}
    });
  }

  private copyLink(token: string): void {
    const url = `${window.location.origin}/checklist/join/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      this.shareCopied = true;
      setTimeout(() => this.shareCopied = false, 2000);
    });
  }

  protected toggleStar(): void {
    if (!this.list) return;
    const newVal = !this.list.starred;
    this.shoppingListService.toggleStar(this.list.id, newVal).subscribe({
      next: () => { if (this.list) this.list.starred = newVal; },
      error: () => {}
    });
  }

  protected toggleCompleted(): void {
    if (!this.list) return;
    const newVal = !this.list.completed;
    const first$ = newVal
      ? this.shoppingItemService.checkAll(this.list.id, true)
      : of(undefined);
    first$.pipe(
      switchMap(() => this.shoppingListService.update(this.list!.id, { completed: newVal }))
    ).subscribe({
      next: () => {
        if (this.list) {
          this.list.completed = newVal;
          if (newVal) this.items.forEach(i => i.checked = true);
        }
      },
      error: () => {}
    });
  }

  protected uncheckAll(): void {
    if (!this.list || this.checkedItems.length === 0) return;
    this.shoppingItemService.checkAll(this.list.id, false).subscribe({
      next: () => {
        this.items.forEach(i => i.checked = false);
        this.shoppingListService.update(this.list!.id, { completed: false }).subscribe({
          next: () => { if (this.list) this.list.completed = false; },
          error: () => {}
        });
      },
      error: () => {}
    });
  }

  protected get batchDeleteCount(): number {
    return this.batchItems.filter(i => i.id !== null && i.toDelete).length;
  }

  protected enterBatchMode(): void {
    this.batchItems = this.items.map(i => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity ?? 1,
      checked: i.checked,
      toDelete: false,
    }));
    this.batchMode = true;
  }

  protected cancelBatch(): void {
    this.batchMode = false;
    this.batchItems = [];
  }

  protected toggleBatchDelete(item: { id: number | null; toDelete: boolean; [k: string]: any }): void {
    item.toDelete = !item.toDelete;
  }

  protected batchAddAttempted = false;

  protected get hasEmptyBatchItem(): boolean {
    return this.batchItems.some(i => i.id === null && !i.name.trim());
  }

  protected removeBatchItem(item: { id: number | null; [k: string]: any }): void {
    this.batchItems = this.batchItems.filter(i => i !== item);
  }

  protected addBatchItem(): void {
    if (this.hasEmptyBatchItem) {
      this.batchAddAttempted = true;
      return;
    }
    this.batchAddAttempted = false;
    this.batchItems.push({ id: null, name: '', quantity: 1, checked: false, toDelete: false });
  }

  protected saveBatch(): void {
    const deleteIds = this.batchItems
      .filter(i => i.id !== null && i.toDelete)
      .map(i => i.id as number);

    const updates = this.batchItems
      .filter(i => i.id !== null && !i.toDelete)
      .map(i => ({ id: i.id as number, name: i.name.trim() || 'Articolo', quantity: i.quantity || 1, checked: i.checked }));

    const newItems = this.batchItems
      .filter(i => i.id === null && !i.toDelete && i.name.trim())
      .map((i, idx) => ({
        shopping_list_id: this.list!.id,
        name: i.name.trim(),
        quantity: i.quantity || 1,
        checked: i.checked,
        sort_order: this.items.length + idx,
      }));

    const bulk$ = this.shoppingItemService.bulkUpdate(updates, deleteIds);
    const creates$ = newItems.map(item => this.shoppingItemService.create(item));

    bulk$.subscribe({
      next: () => {
        if (creates$.length === 0) {
          this.batchMode = false;
          this.batchItems = [];
          this.reload();
          return;
        }
        let done = 0;
        creates$.forEach(req => req.subscribe({
          next: () => {
            done++;
            if (done === creates$.length) {
              this.batchMode = false;
              this.batchItems = [];
              this.reload();
            }
          },
          error: () => {}
        }));
      },
      error: () => {}
    });
  }

  protected goBack(): void {
    this.router.navigate(['/checklist']);
  }

  protected toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  protected get participantCount(): number {
    return this.list?.participants?.length ?? 0;
  }

  protected get sortedParticipants(): ShoppingListParticipant[] {
    if (!this.list?.participants) return [];
    return [...this.list.participants].sort((a, b) => {
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

  protected onAddKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.addItem();
    if (event.key === 'Escape') { this.addingItem = false; this.newItemName = ''; }
  }

  protected onEditKeydown(event: KeyboardEvent, item: ShoppingItem): void {
    if (event.key === 'Enter') this.saveEdit(item);
    if (event.key === 'Escape') this.cancelEdit();
  }
}
