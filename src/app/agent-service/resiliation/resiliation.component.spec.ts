import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResiliationComponent } from './resiliation.component';

describe('ResiliationComponent', () => {
  let component: ResiliationComponent;
  let fixture: ComponentFixture<ResiliationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResiliationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResiliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
