import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoPromotoresComponent } from './evento-promotores.component';

describe('EventoPromotoresComponent', () => {
  let component: EventoPromotoresComponent;
  let fixture: ComponentFixture<EventoPromotoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoPromotoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventoPromotoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
