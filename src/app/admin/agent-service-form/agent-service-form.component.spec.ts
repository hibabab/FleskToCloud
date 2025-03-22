import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentServiceFormComponent } from './agent-service-form.component';

describe('AgentServiceFormComponent', () => {
  let component: AgentServiceFormComponent;
  let fixture: ComponentFixture<AgentServiceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentServiceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentServiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
