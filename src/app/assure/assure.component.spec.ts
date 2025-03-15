import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssureComponent } from './assure.component';

describe('AssureComponent', () => {
  let component: AssureComponent;
  let fixture: ComponentFixture<AssureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
