import { TestBed } from '@angular/core/testing';

import { ListGuard } from './list.guard';

describe('JoinGuard', () => {
  let guard: ListGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ListGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
