import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisCVieComponent } from './devis-cvie.component';

describe('DevisCVieComponent', () => {
  let component: DevisCVieComponent;
  let fixture: ComponentFixture<DevisCVieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DevisCVieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisCVieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
