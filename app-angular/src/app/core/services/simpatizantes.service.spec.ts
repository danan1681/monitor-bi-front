import { TestBed } from '@angular/core/testing';

import { SimpatizantesService } from './simpatizantes.service';

describe('SimpatizantesService', () => {
  let service: SimpatizantesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpatizantesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
