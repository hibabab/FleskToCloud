import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistanceComponent } from './assistance.component';

describe('AssistanceComponent', () => {
  let component: AssistanceComponent;
  let fixture: ComponentFixture<AssistanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssistanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
