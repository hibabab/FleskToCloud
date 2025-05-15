import { TestBed } from '@angular/core/testing';

import { ContratautoService } from './contratauto.service';

describe('ContratautoService', () => {
  let service: ContratautoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContratautoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
