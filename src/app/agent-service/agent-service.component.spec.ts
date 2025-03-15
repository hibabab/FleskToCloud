import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentServiceComponent } from './agent-service.component';

describe('AgentServiceComponent', () => {
  let component: AgentServiceComponent;
  let fixture: ComponentFixture<AgentServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
