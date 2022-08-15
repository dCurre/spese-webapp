import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseListDetailsComponent } from './expenses-list-details.component';

describe('ExpenseListDetailsComponent', () => {
  let component: ExpenseListDetailsComponent;
  let fixture: ComponentFixture<ExpenseListDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpenseListDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseListDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
