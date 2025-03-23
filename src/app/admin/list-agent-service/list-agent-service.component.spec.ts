import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAgentServiceComponent } from './list-agent-service.component';

describe('ListAgentServiceComponent', () => {
  let component: ListAgentServiceComponent;
  let fixture: ComponentFixture<ListAgentServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListAgentServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAgentServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
