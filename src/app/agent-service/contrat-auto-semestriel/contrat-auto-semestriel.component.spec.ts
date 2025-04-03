import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratAutoSemestrielComponent } from './contrat-auto-semestriel.component';

describe('ContratAutoSemestrielComponent', () => {
  let component: ContratAutoSemestrielComponent;
  let fixture: ComponentFixture<ContratAutoSemestrielComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContratAutoSemestrielComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratAutoSemestrielComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
