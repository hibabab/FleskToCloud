import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationAssureComponent } from './notification-assure.component';

describe('NotificationAssureComponent', () => {
  let component: NotificationAssureComponent;
  let fixture: ComponentFixture<NotificationAssureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationAssureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationAssureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
