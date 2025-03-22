import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertFormComponent } from './expert-form.component';

describe('ExpertFormComponent', () => {
  let component: ExpertFormComponent;
  let fixture: ComponentFixture<ExpertFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpertFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpertFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
