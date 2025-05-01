import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueContratVieAComponent } from './historique-contrat-vie-a.component';

describe('HistoriqueContratVieAComponent', () => {
  let component: HistoriqueContratVieAComponent;
  let fixture: ComponentFixture<HistoriqueContratVieAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoriqueContratVieAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueContratVieAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
