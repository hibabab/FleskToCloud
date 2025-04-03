import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenouvellementCAComponent } from './renouvellement-ca.component';

describe('RenouvellementCAComponent', () => {
  let component: RenouvellementCAComponent;
  let fixture: ComponentFixture<RenouvellementCAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RenouvellementCAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenouvellementCAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
