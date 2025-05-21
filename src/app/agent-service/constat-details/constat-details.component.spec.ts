import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstatDetailsComponent } from './constat-details.component';

describe('ConstatDetailsComponent', () => {
  let component: ConstatDetailsComponent;
  let fixture: ComponentFixture<ConstatDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConstatDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstatDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
