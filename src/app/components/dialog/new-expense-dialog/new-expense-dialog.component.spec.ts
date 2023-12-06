import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewExpenseDialogComponent } from './new-expense-dialog.component';

describe('NewExpenseDialogComponent', () => {
  let component: NewExpenseDialogComponent;
  let fixture: ComponentFixture<NewExpenseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewExpenseDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewExpenseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
