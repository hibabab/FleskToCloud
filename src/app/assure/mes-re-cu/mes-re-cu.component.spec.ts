import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesReCuComponent } from './mes-re-cu.component';

describe('MesReCuComponent', () => {
  let component: MesReCuComponent;
  let fixture: ComponentFixture<MesReCuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MesReCuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesReCuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
