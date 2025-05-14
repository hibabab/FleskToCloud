import { TestBed } from '@angular/core/testing';

import { CarteGriseServiceService } from './carte-grise-service.service';

describe('CarteGriseServiceService', () => {
  let service: CarteGriseServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarteGriseServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
