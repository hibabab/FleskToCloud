import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisAvieComponent } from './devis-avie.component';

describe('DevisAvieComponent', () => {
  let component: DevisAvieComponent;
  let fixture: ComponentFixture<DevisAvieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DevisAvieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisAvieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
