import { TestBed } from '@angular/core/testing';

import { ListDetailsGuard } from './list-details.guard';

describe('JoinGuard', () => {
  let guard: ListDetailsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ListDetailsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
