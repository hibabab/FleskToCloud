import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstatTermineeComponent } from './constat-terminee.component';

describe('ConstatTermineeComponent', () => {
  let component: ConstatTermineeComponent;
  let fixture: ComponentFixture<ConstatTermineeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConstatTermineeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstatTermineeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
