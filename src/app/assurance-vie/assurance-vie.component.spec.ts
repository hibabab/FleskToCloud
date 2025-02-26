import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssuranceVieComponent } from './assurance-vie.component';

describe('AssuranceVieComponent', () => {
  let component: AssuranceVieComponent;
  let fixture: ComponentFixture<AssuranceVieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssuranceVieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssuranceVieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
