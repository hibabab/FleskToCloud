import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CASemstrielComponent } from './casemstriel.component';

describe('CASemstrielComponent', () => {
  let component: CASemstrielComponent;
  let fixture: ComponentFixture<CASemstrielComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CASemstrielComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CASemstrielComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
