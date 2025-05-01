import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInitiateVieComponent } from './payment-initiate-vie.component';

describe('PaymentInitiateVieComponent', () => {
  let component: PaymentInitiateVieComponent;
  let fixture: ComponentFixture<PaymentInitiateVieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentInitiateVieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentInitiateVieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
