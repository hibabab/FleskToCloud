import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeAutoComponent } from './liste-auto.component';

describe('ListeAutoComponent', () => {
  let component: ListeAutoComponent;
  let fixture: ComponentFixture<ListeAutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeAutoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeAutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
