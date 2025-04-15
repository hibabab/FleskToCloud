import { TestBed } from '@angular/core/testing';

import { ExpertconstatService } from './expertconstat.service';

describe('ExpertconstatService', () => {
  let service: ExpertconstatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpertconstatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
