import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstatEnAttenteComponent } from './constat-en-attente.component';

describe('ConstatEnAttenteComponent', () => {
  let component: ConstatEnAttenteComponent;
  let fixture: ComponentFixture<ConstatEnAttenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConstatEnAttenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstatEnAttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
