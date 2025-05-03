import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaldoDetailsComponent } from './saldo-details.component';

describe('SaldoDetailsComponent', () => {
  let component: SaldoDetailsComponent;
  let fixture: ComponentFixture<SaldoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaldoDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaldoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
