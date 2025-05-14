import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteGriseComponent } from './carte-grise.component';

describe('CarteGriseComponent', () => {
  let component: CarteGriseComponent;
  let fixture: ComponentFixture<CarteGriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarteGriseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteGriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
