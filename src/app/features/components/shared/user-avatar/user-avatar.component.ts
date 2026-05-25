import { Component, Input } from '@angular/core';
import { User } from 'src/app/core/services/postgres/user/user';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.css'],
})
export class UserAvatarComponent {
  /** L'utente di cui mostrare l'avatar */
  @Input() user!: Pick<User, 'name' | 'surname' | 'profile_image'>;

  /** Dimensione in px (default 40) */
  @Input() size = 40;

  /** 'circle' per sidebar, 'rounded' per profilo (default 'circle') */
  @Input() shape: 'circle' | 'rounded' = 'circle';

  /** Nasconde il border (es. quando il contenitore padre ha già il suo border) */
  @Input() noBorder = false;

  protected imageError = false;

  protected get initials(): string {
    const first = this.user?.name?.[0]?.toUpperCase() ?? '';
    const second = this.user?.surname?.[0]?.toUpperCase() ?? '';
    return first + second;
  }

  protected get borderRadius(): string {
    if (this.shape === 'circle') return '50%';
    // rounded square: scala proporzionalmente come in .profile-avatar (18px per 64px)
    return `${Math.round(this.size * 0.28)}px`;
  }

  protected get fontSize(): string {
    return `${Math.round(this.size * 0.38)}px`;
  }

  protected onImageError(): void {
    this.imageError = true;
  }
}
