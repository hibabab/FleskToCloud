import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationCVieComponent } from './creation-c-vie.component';

describe('CreationCVieComponent', () => {
  let component: CreationCVieComponent;
  let fixture: ComponentFixture<CreationCVieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreationCVieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreationCVieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
