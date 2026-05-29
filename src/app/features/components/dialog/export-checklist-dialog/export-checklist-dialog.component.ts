import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ShoppingList, ShoppingCategory, ShoppingItem } from 'src/app/core/services/postgres/shopping-list/shopping-list';
import { ToastService } from 'src/app/core/services/toast/toast.service';

@Component({
  selector: 'app-export-checklist-dialog',
  templateUrl: './export-checklist-dialog.component.html',
  styleUrls: ['./export-checklist-dialog.component.css'],
})
export class ExportChecklistDialogComponent {
  @Input() list!: ShoppingList;

  protected selectedFormat: 'text' | 'json' = 'text';
  protected textCopied = false;

  private readonly exportedAt = new Date().toISOString();

  constructor(public modal: NgbActiveModal, private toastService: ToastService) {}

  protected get previewText(): string {
    return this.selectedFormat === 'text' ? this.buildText() : this.buildJson();
  }

  protected copyText(): void {
    navigator.clipboard.writeText(this.previewText).then(() => {
      this.textCopied = true;
      this.toastService.success(
        this.selectedFormat === 'text' ? 'Testo copiato negli appunti!' : 'JSON copiato negli appunti!'
      );
      setTimeout(() => (this.textCopied = false), 2000);
    });
  }

  protected downloadText(): void {
    const blob = new Blob([this.buildText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.sanitizeFilename(this.list.name)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this.toastService.success('File TXT scaricato!');
  }

  protected downloadJson(): void {
    const json = this.buildJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.sanitizeFilename(this.list.name)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toastService.success('File JSON scaricato!');
  }

  private buildText(): string {
    const lines: string[] = [];

    // Item senza categoria
    const uncategorized = (this.list.items || []);
    if (uncategorized.length) {
      for (const item of uncategorized) {
        lines.push(this.formatItem(item));
      }
    }

    // Categorie
    for (const cat of (this.list.categories || [])) {
      lines.push(...this.formatCategory(cat, 0));
    }

    return lines.join('\n');
  }

  private formatCategory(cat: ShoppingCategory, indent: number): string[] {
    const lines: string[] = [];
    const prefix = '  '.repeat(indent);
    const allItems = this.allItemsInCategory(cat);
    const checkedCount = allItems.filter(i => i.checked).length;
    const badge = allItems.length ? ` (${checkedCount}/${allItems.length})` : '';
    lines.push(`${prefix}📁 ${cat.name}${badge}`);
    for (const item of (cat.items || [])) {
      lines.push(`${prefix}  ${this.formatItem(item)}`);
    }
    for (const child of (cat.children || [])) {
      lines.push(...this.formatCategory(child, indent + 1));
    }
    return lines;
  }

  private formatItem(item: ShoppingItem): string {
    const check = item.checked ? '✓' : '○';
    const qty = item.quantity ? ` ×${item.quantity}` : '';
    return `${check} ${item.name}${qty}`;
  }

  private allItemsInCategory(cat: ShoppingCategory): ShoppingItem[] {
    const items = [...(cat.items || [])];
    for (const child of (cat.children || [])) {
      items.push(...this.allItemsInCategory(child));
    }
    return items;
  }

  private buildJson(): string {
    const data = {
      name: this.list.name,
      exported_at: this.exportedAt,
      items: (this.list.items || []).map(i => ({
        name: i.name,
        quantity: i.quantity ?? null,
        checked: i.checked,
        category: null,
      })),
      categories: (this.list.categories || []).map(c => this.serializeCategory(c)),
    };
    return JSON.stringify(data, null, 2);
  }

  private serializeCategory(cat: ShoppingCategory): object {
    return {
      name: cat.name,
      items: (cat.items || []).map(i => ({
        name: i.name,
        quantity: i.quantity ?? null,
        checked: i.checked,
      })),
      children: (cat.children || []).map(c => this.serializeCategory(c)),
    };
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
  }
}
