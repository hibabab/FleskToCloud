import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisCAComponent } from './devis-ca.component';

describe('DevisCAComponent', () => {
  let component: DevisCAComponent;
  let fixture: ComponentFixture<DevisCAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DevisCAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisCAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
