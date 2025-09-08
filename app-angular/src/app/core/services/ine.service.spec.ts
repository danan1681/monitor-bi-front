import { TestBed } from '@angular/core/testing';

import { IneService } from './ine.service';

describe('IneService', () => {
  let service: IneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
