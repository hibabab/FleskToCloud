import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DehasbortComponent } from './dehasbort.component';

describe('DehasbortComponent', () => {
  let component: DehasbortComponent;
  let fixture: ComponentFixture<DehasbortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DehasbortComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DehasbortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
