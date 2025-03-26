import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratAutoComponent } from './contrat-auto.component';

describe('ContratAutoComponent', () => {
  let component: ContratAutoComponent;
  let fixture: ComponentFixture<ContratAutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContratAutoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratAutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
