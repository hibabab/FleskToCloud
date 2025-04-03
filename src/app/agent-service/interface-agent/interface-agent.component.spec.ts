import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceAgentComponent } from './interface-agent.component';

describe('InterfaceAgentComponent', () => {
  let component: InterfaceAgentComponent;
  let fixture: ComponentFixture<InterfaceAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterfaceAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterfaceAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
