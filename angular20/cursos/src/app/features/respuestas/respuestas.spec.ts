import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestasPage } from './pages/respuestas.page';

describe('RespuestasPage', () => {
  let component: RespuestasPage;
  let fixture: ComponentFixture<RespuestasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RespuestasPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RespuestasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
