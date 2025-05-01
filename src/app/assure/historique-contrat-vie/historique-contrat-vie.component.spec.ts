import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueContratVieComponent } from './historique-contrat-vie.component';

describe('HistoriqueContratVieComponent', () => {
  let component: HistoriqueContratVieComponent;
  let fixture: ComponentFixture<HistoriqueContratVieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoriqueContratVieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueContratVieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
