import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesCAComponent } from './mes-ca.component';

describe('MesCAComponent', () => {
  let component: MesCAComponent;
  let fixture: ComponentFixture<MesCAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MesCAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesCAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
