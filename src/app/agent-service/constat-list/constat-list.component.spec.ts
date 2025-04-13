import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstatListComponent } from './constat-list.component';

describe('ConstatListComponent', () => {
  let component: ConstatListComponent;
  let fixture: ComponentFixture<ConstatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConstatListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
