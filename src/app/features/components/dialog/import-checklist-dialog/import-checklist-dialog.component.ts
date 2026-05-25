import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface ParsedItem {
  name: string;
  checked: boolean;
}

export interface ImportChecklistResult {
  name?: string;       // solo se mode === 'new'
  items: ParsedItem[];
}

@Component({
  selector: 'app-import-checklist-dialog',
  templateUrl: './import-checklist-dialog.component.html',
  styleUrls: ['./import-checklist-dialog.component.css'],
})
export class ImportChecklistDialogComponent {
  /** 'new' = dalla lista (chiede anche il nome), 'add' = dall'interno di una checklist */
  @Input() mode: 'new' | 'add' = 'new';

  protected listName = '';
  protected rawText = '';
  protected parseError = false;
  protected attempted = false;

  constructor(public modal: NgbActiveModal) {}

  protected get parsedItems(): ParsedItem[] {
    return this.parseText(this.rawText);
  }

  protected get isValid(): boolean {
    const items = this.parsedItems;
    if (items.length === 0) return false;
    if (this.mode === 'new' && !this.listName.trim()) return false;
    return true;
  }

  protected confirm(): void {
    this.attempted = true;
    if (!this.isValid) return;
    const result: ImportChecklistResult = {
      items: this.parsedItems,
    };
    if (this.mode === 'new') result.name = this.listName.trim();
    this.modal.close(result);
  }

  private parseText(text: string): ParsedItem[] {
    if (!text.trim()) return [];
    const items: ParsedItem[] = [];

    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;

      // Formato Samsung Notes: [v] Nome  oppure [  ] Nome
      const samsungMatch = line.match(/^\[([^\]]*)\]\s*(.+)$/);
      if (samsungMatch) {
        const checkMark = samsungMatch[1].trim();
        const name = samsungMatch[2].trim();
        if (!name) continue;
        items.push({ name, checked: checkMark === 'v' || checkMark === 'x' || checkMark === '✓' });
        continue;
      }

      // Fallback: riga senza marcatura → item non spuntato
      if (line.length > 0) {
        items.push({ name: line, checked: false });
      }
    }

    return items;
  }
}
