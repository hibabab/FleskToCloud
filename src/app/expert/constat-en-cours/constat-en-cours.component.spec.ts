import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstatEnCoursComponent } from './constat-en-cours.component';

describe('ConstatEnCoursComponent', () => {
  let component: ConstatEnCoursComponent;
  let fixture: ComponentFixture<ConstatEnCoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConstatEnCoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstatEnCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
