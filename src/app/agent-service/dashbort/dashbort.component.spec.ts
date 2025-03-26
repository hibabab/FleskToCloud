import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbortComponent } from './dashbort.component';

describe('DashbortComponent', () => {
  let component: DashbortComponent;
  let fixture: ComponentFixture<DashbortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashbortComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashbortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
