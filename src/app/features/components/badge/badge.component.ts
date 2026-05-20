import { Component, Input } from '@angular/core';

export type BadgeVariant =
  | 'active'
  | 'paid'
  | 'shared'
  | 'personal'
  | 'unknown'
  | 'owner';

const VARIANT_CONFIG: Record<BadgeVariant, { icon: string; label: string }> = {
  active:   { icon: 'fa-circle-check', label: 'Attivo' },
  paid:     { icon: 'fa-lock',         label: 'Saldato' },
  shared:   { icon: 'fa-users',        label: 'Condivisa' },
  personal: { icon: 'fa-user',         label: 'Personale' },
  unknown:  { icon: 'fa-question',     label: 'Non taggato' },
  owner:    { icon: 'fa-crown',        label: 'Proprietario' },
};

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css']
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'active';
  @Input() label?: string;

  get icon(): string {
    return VARIANT_CONFIG[this.variant]?.icon ?? 'fa-tag';
  }

  get displayLabel(): string {
    return this.label ?? VARIANT_CONFIG[this.variant]?.label ?? '';
  }
}
