import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditarSimpatizanteComponent } from './dialog-editar-simpatizante.component';

describe('DialogEditarSimpatizanteComponent', () => {
  let component: DialogEditarSimpatizanteComponent;
  let fixture: ComponentFixture<DialogEditarSimpatizanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditarSimpatizanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditarSimpatizanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
