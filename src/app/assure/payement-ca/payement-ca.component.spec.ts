import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayementCAComponent } from './payement-ca.component';

describe('PayementCAComponent', () => {
  let component: PayementCAComponent;
  let fixture: ComponentFixture<PayementCAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayementCAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayementCAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
