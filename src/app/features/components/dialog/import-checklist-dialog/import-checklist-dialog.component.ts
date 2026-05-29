import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/core/services/toast/toast.service';

export interface ParsedItem {
  name: string;
  checked: boolean;
  quantity?: number | null;
}

export interface ParsedCategory {
  name: string;
  items: ParsedItem[];
  children: ParsedCategory[];
}

export interface ImportChecklistResult {
  name?: string;           // solo se mode === 'new'
  items: ParsedItem[];     // item senza categoria (flat o testo)
  categories?: ParsedCategory[];  // categorie strutturate (solo JSON)
}

@Component({
  selector: 'app-import-checklist-dialog',
  templateUrl: './import-checklist-dialog.component.html',
  styleUrls: ['./import-checklist-dialog.component.css'],
})
export class ImportChecklistDialogComponent {
  /** 'new' = dalla lista (chiede anche il nome), 'add' = dall'interno di una checklist */
  @Input() mode: 'new' | 'add' = 'new';

  protected importFormat: 'text' | 'json' = 'text';

  protected listName = '';
  protected rawText = '';
  protected parseError = false;
  protected attempted = false;
  protected jsonError: string | null = null;
  protected textFormatError: string | null = null;
  protected loadedFileName = '';
  protected isDragging = false;

  // Risultati parsed — aggiornati su ogni ngModelChange del textarea
  protected parsedItems: ParsedItem[] = [];
  protected parsedJson: ImportChecklistResult | null = null;
  protected jsonPreviewCategories: ParsedCategory[] = [];
  protected jsonPreviewItems: ParsedItem[] = [];

  constructor(public modal: NgbActiveModal, private toastService: ToastService) {}

  protected onRawTextChange(text: string): void {
    this.rawText = text;
    if (this.importFormat === 'text') {
      const t = text.trim();
      if (t.startsWith('{') || t.startsWith('[')) {
        this.textFormatError = 'Sembra un JSON. Seleziona il formato JSON.';
        this.parsedItems = [];
      } else {
        this.textFormatError = null;
        this.parsedItems = this.parseText(text);
      }
    } else {
      const t = text.trim();
      if (t && !t.startsWith('{') && !t.startsWith('[')) {
        this.jsonError = 'Formato non valido. Incolla il JSON esportato dall\'app.';
        this.parsedJson = null;
        this.jsonPreviewCategories = [];
        this.jsonPreviewItems = [];
      } else {
        this.parsedJson = this.parseJson(text);
        this.jsonPreviewCategories = this.parsedJson?.categories ?? [];
        this.jsonPreviewItems = this.parsedJson?.items ?? [];
      }
    }
  }

  protected countAllItems(cats: ParsedCategory[]): number {
    let n = 0;
    for (const c of cats) {
      n += c.items.length + this.countAllItems(c.children);
    }
    return n;
  }

  // ── VALIDATION ────────────────────────────────────────────────

  protected get isValid(): boolean {
    if (this.mode === 'new' && !this.listName.trim()) return false;
    if (!this.rawText.trim()) return false;
    if (this.importFormat === 'text') {
      if (this.textFormatError) return false;
      return this.parsedItems.length > 0;
    }
    if (this.jsonError || !this.parsedJson) return false;
    return (this.parsedJson.items?.length ?? 0) > 0 || (this.parsedJson.categories?.length ?? 0) > 0;
  }

  // ── CONFIRM ───────────────────────────────────────────────────

  protected confirm(): void {
    this.attempted = true;
    if (!this.isValid) return;

    let result: ImportChecklistResult;

    if (this.importFormat === 'text') {
      result = { items: this.parsedItems };
    } else {
      result = { items: this.parsedJson!.items ?? [], categories: this.parsedJson!.categories ?? [] };
    }

    if (this.mode === 'new') result.name = this.listName.trim();
    this.modal.close(result);
  }

  protected onFormatChange(fmt: 'text' | 'json'): void {
    this.importFormat = fmt;
    this.rawText = '';
    this.jsonError = null;
    this.textFormatError = null;
    this.attempted = false;
    this.parsedItems = [];
    this.parsedJson = null;
    this.jsonPreviewCategories = [];
    this.jsonPreviewItems = [];
    this.loadedFileName = '';
    this.isDragging = false;
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.loadFile(file);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  protected onDragLeave(): void {
    this.isDragging = false;
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.loadFile(file);
  }

  protected clearFile(): void {
    this.loadedFileName = '';
    this.rawText = '';
    this.parsedItems = [];
    this.parsedJson = null;
    this.jsonPreviewCategories = [];
    this.jsonPreviewItems = [];
    this.jsonError = null;
    this.textFormatError = null;
    this.attempted = false;
  }

  private loadFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string ?? '';
      const t = text.trim();
      if (this.importFormat === 'text' && (t.startsWith('{') || t.startsWith('['))) {
        this.toastService.error('Formato non corretto, carica un file .txt');
        return;
      }
      if (this.importFormat === 'json' && t && !t.startsWith('{') && !t.startsWith('[')) {
        this.toastService.error('Formato non corretto, carica un file .json');
        return;
      }
      this.loadedFileName = file.name;
      this.onRawTextChange(text);
    };
    reader.readAsText(file, 'utf-8');
  }

  // ── PARSERS ───────────────────────────────────────────────────

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

      // Formato export testo app: ✓ Nome ×qty  oppure ○ Nome ×qty
      const exportMatch = line.match(/^[✓○]\s+(.+?)(?:\s+×(\d+))?$/);
      if (exportMatch) {
        const name = exportMatch[1].trim();
        const qty = exportMatch[2] ? parseInt(exportMatch[2], 10) : null;
        const checked = line.startsWith('✓');
        if (name) items.push({ name, checked, quantity: qty });
        continue;
      }

      // Fallback: riga senza marcatura → item non spuntato
      if (line.length > 0) {
        items.push({ name: line, checked: false });
      }
    }

    return items;
  }

  private parseJson(text: string): ImportChecklistResult | null {
    if (!text.trim()) return null;
    try {
      const data = JSON.parse(text);
      this.jsonError = null;

      const mapItem = (i: any): ParsedItem => ({
        name: String(i.name ?? ''),
        checked: Boolean(i.checked),
        quantity: i.quantity ?? null,
      });

      const mapCategory = (c: any): ParsedCategory => ({
        name: String(c.name ?? ''),
        items: (c.items ?? []).map(mapItem),
        children: (c.children ?? []).map(mapCategory),
      });

      return {
        items: (data.items ?? []).map(mapItem),
        categories: (data.categories ?? []).map(mapCategory),
      };
    } catch (e) {
      this.jsonError = 'JSON non valido. Incolla il contenuto esportato dall\'app.';
      return null;
    }
  }
}
