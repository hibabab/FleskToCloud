import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSuccessVieComponent } from './payment-success-vie.component';

describe('PaymentSuccessVieComponent', () => {
  let component: PaymentSuccessVieComponent;
  let fixture: ComponentFixture<PaymentSuccessVieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentSuccessVieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSuccessVieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
