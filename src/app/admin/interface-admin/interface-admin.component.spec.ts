import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceAdminComponent } from './interface-admin.component';

describe('InterfaceAdminComponent', () => {
  let component: InterfaceAdminComponent;
  let fixture: ComponentFixture<InterfaceAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterfaceAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterfaceAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
