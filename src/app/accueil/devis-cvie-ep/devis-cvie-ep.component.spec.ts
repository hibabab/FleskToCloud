import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisCVieEpComponent } from './devis-cvie-ep.component';

describe('DevisCVieEpComponent', () => {
  let component: DevisCVieEpComponent;
  let fixture: ComponentFixture<DevisCVieEpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DevisCVieEpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisCVieEpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
