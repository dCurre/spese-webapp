import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDetailsDialogComponent } from './list-details-dialog.component';

describe('ListDetailsDialogComponent', () => {
  let component: ListDetailsDialogComponent;
  let fixture: ComponentFixture<ListDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListDetailsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
