import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeSouscriptionVieComponent } from './demande-souscription-vie.component';

describe('DemandeSouscriptionVieComponent', () => {
  let component: DemandeSouscriptionVieComponent;
  let fixture: ComponentFixture<DemandeSouscriptionVieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DemandeSouscriptionVieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeSouscriptionVieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
