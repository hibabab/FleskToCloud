import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInitiateComponent } from './payment-initiate.component';

describe('PaymentInitiateComponent', () => {
  let component: PaymentInitiateComponent;
  let fixture: ComponentFixture<PaymentInitiateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentInitiateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentInitiateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
