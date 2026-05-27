import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ShoppingList } from 'src/app/core/services/postgres/shopping-list/shopping-list';
import { ShoppingListService } from 'src/app/core/services/postgres/shopping-list/shopping-list.service';
import { NewChecklistDialogComponent } from '../dialog/new-checklist-dialog/new-checklist-dialog.component';
import { ImportChecklistDialogComponent, ImportChecklistResult, ParsedCategory } from '../dialog/import-checklist-dialog/import-checklist-dialog.component';
import { User } from 'src/app/core/services/postgres/user/user';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css']
})
export class ChecklistComponent implements OnInit, OnDestroy {
  protected allLists: ShoppingList[] = [];
  protected loggedUser: User | null = null;
  protected hasLoaded = false;
  protected loadError = false;
  protected searchTerm = '';
  protected sortBy: 'name' | 'date' = 'date';
  protected sortAsc = false;

  constructor(
    private authService: AuthService,
    private shoppingListService: ShoppingListService,
    private modalService: NgbModal,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  private load(): void {
    this.authService.getUser().then(user => {
      if (!user) { this.hasLoaded = true; this.loadError = true; return; }
      this.loggedUser = user;
      this.loadLists(user.id);
    }).catch(() => {
      this.hasLoaded = true;
      this.loadError = true;
    });
  }

  private loadLists(userId: number): void {
    this.shoppingListService.getByUser(userId).subscribe({
      next: (res) => {
        this.allLists = res.shopping_lists;
        this.hasLoaded = true;
        this.loadError = false;
      },
      error: () => {
        this.hasLoaded = true;
        this.loadError = true;
      }
    });
  }

  private reloadLists(): void {
    if (!this.loggedUser) return;
    this.shoppingListService.getByUser(this.loggedUser.id).subscribe({
      next: (res) => this.allLists = res.shopping_lists,
      error: () => {}
    });
  }

  protected get filteredLists(): ShoppingList[] {
    let lists = [...this.allLists];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      lists = lists.filter(l => l.name.toLowerCase().includes(term));
    }
    lists.sort((a, b) => {
      const cmp = this.sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return this.sortAsc ? cmp : -cmp;
    });
    return lists;
  }

  protected get starredLists(): ShoppingList[] {
    return this.filteredLists.filter(l => l.starred);
  }

  protected get activeLists(): ShoppingList[] {
    return this.filteredLists.filter(l => !l.completed && !l.starred);
  }

  protected get completedLists(): ShoppingList[] {
    return this.filteredLists.filter(l => l.completed && !l.starred);
  }

  protected newChecklist(): void {
    if (!this.loggedUser) return;
    (document.activeElement as HTMLElement)?.blur();
    const modal = this.modalService.open(NewChecklistDialogComponent, { centered: true });
    modal.result.then((result) => {
      if (!result) return;
      this.shoppingListService.create({
        name: result.name,
        list_type: result.list_type,
        owner_id: this.loggedUser!.id,
        completed: false,
      }).subscribe({
        next: () => this.reloadLists(),
        error: () => {}
      });
    }).catch(() => {});
  }

  protected toggleStar(list: ShoppingList, event: Event): void {
    event.stopPropagation();
    const newVal = !list.starred;
    this.shoppingListService.toggleStar(list.id, newVal).subscribe({
      next: () => list.starred = newVal,
      error: () => {}
    });
  }

  protected deleteList(list: ShoppingList, event: Event): void {
    event.stopPropagation();
    this.shoppingListService.delete(list.id).subscribe({
      next: () => this.reloadLists(),
      error: () => {}
    });
  }

  protected progressPercent(list: ShoppingList): number {
    if (!list.items_count || list.items_count === 0) return 0;
    return Math.round(((list.checked_count ?? 0) / list.items_count) * 100);
  }

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('it-IT');
  }

  protected importChecklist(): void {
    if (!this.loggedUser) return;
    (document.activeElement as HTMLElement)?.blur();
    const modal = this.modalService.open(ImportChecklistDialogComponent, { centered: true, size: 'lg' });
    modal.componentInstance.mode = 'new';
    modal.result.then((result: ImportChecklistResult | null) => {
      if (!result) return;
      this.shoppingListService.create({
        name: result.name,
        list_type: 'personal',
        owner_id: this.loggedUser!.id,
        completed: false,
      }).subscribe({
        next: (res) => {
          const payload = this.buildImportBatchPayload(result);
          this.shoppingListService.batchSave(res.id, payload).subscribe({
            next: () => {
              this.reloadLists();
              this.router.navigate(['/checklist', res.id]);
            },
            error: () => this.reloadLists(),
          });
        },
        error: () => {},
      });
    }).catch(() => {});
  }

  private buildImportBatchPayload(result: ImportChecklistResult): {
    categories_create: { temp_id: string; name: string; parent_id: string | null; sort_order: number }[];
    items_create: { name: string; quantity: number | null; checked: boolean; sort_order: number; category_id: null; category_temp_id?: string }[];
  } {
    const categories_create: { temp_id: string; name: string; parent_id: string | null; sort_order: number }[] = [];
    const items_create: { name: string; quantity: number | null; checked: boolean; sort_order: number; category_id: null; category_temp_id?: string }[] = [];
    let sortIdx = 0;
    let catIdx = 0;

    for (const item of (result.items ?? [])) {
      items_create.push({ name: item.name, quantity: item.quantity ?? null, checked: item.checked, sort_order: sortIdx++, category_id: null });
    }

    const flattenCategory = (cat: ParsedCategory, parentTempId: string | null) => {
      const tempId = `import_cat_${catIdx++}`;
      categories_create.push({ temp_id: tempId, name: cat.name, parent_id: parentTempId, sort_order: catIdx });
      for (const item of (cat.items ?? [])) {
        items_create.push({ name: item.name, quantity: item.quantity ?? null, checked: item.checked, sort_order: sortIdx++, category_id: null, category_temp_id: tempId });
      }
      for (const child of (cat.children ?? [])) {
        flattenCategory(child, tempId);
      }
    };

    for (const cat of (result.categories ?? [])) {
      flattenCategory(cat, null);
    }

    return { categories_create, items_create };
  }

  protected retry(): void {
    this.hasLoaded = false;
    this.loadError = false;
    this.load();
  }
}
