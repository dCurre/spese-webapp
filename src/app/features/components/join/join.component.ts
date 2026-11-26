import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpensesListInvite, ExpensesListService } from 'src/app/core/services/postgres/expenses-list/expenses-list.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  protected invite: ExpensesListInvite | null = null;
  private token: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pgExpensesListService: ExpensesListService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.pgExpensesListService.previewInvite(this.token).subscribe({
        next: (invite) => this.invite = invite,
        error: (e) => console.error('JoinComponent.preview:', e)
      });
    });
  }

  join() {
    this.pgExpensesListService.joinByInvite(this.token).subscribe({
      next: (res) => this.router.navigate(['/list', res.id]),
      error: (e) => console.error('JoinComponent.join:', e)
    });
  }
}
