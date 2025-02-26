import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssuranceAutoComponent } from './assurance-auto.component';

describe('AssuranceAutoComponent', () => {
  let component: AssuranceAutoComponent;
  let fixture: ComponentFixture<AssuranceAutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssuranceAutoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssuranceAutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
