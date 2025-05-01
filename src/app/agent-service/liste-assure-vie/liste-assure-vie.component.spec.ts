import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeAssureVieComponent } from './liste-assure-vie.component';

describe('ListeAssureVieComponent', () => {
  let component: ListeAssureVieComponent;
  let fixture: ComponentFixture<ListeAssureVieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeAssureVieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeAssureVieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
