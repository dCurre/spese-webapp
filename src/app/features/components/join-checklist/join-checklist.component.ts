import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ShoppingListService } from 'src/app/core/services/postgres/shopping-list/shopping-list.service';

@Component({
  selector: 'app-join-checklist',
  templateUrl: './join-checklist.component.html',
  styleUrls: ['./join-checklist.component.css']
})
export class JoinChecklistComponent implements OnInit {
  protected state: 'loading' | 'error' = 'loading';
  protected errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private shoppingListService: ShoppingListService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) { this.fail('Link non valido.'); return; }

    this.authService.getUser().then(user => {
      if (!user) { this.fail('Devi essere loggato per unirti a una checklist.'); return; }

      this.shoppingListService.joinByToken(token, user.id).subscribe({
        next: (res) => {
          this.router.navigate(['/checklist', res.id]);
        },
        error: () => this.fail('Il link non è valido o è scaduto.')
      });
    });
  }

  private fail(msg: string): void {
    this.state = 'error';
    this.errorMessage = msg;
  }

  protected goHome(): void {
    this.router.navigate(['/checklist']);
  }
}
