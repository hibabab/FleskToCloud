import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviComponent } from './devi.component';

describe('DeviComponent', () => {
  let component: DeviComponent;
  let fixture: ComponentFixture<DeviComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeviComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
