import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CursosPage } from './pages/cursos.page';
import { CursosService } from './services/cursos.service';

describe('CursosPage', () => {
  let component: CursosPage;
  let fixture: ComponentFixture<CursosPage>;
  const cursosService = {
    listar: jasmine.createSpy('listar').and.returnValue(of([
      { id: 1, nombre: 'Angular' },
      { id: 2, nombre: 'Spring Boot' },
    ])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursosPage],
      providers: [{ provide: CursosService, useValue: cursosService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CursosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads and displays courses from the service', () => {
    expect(cursosService.listar).toHaveBeenCalled();
    expect(component.cursos().map((curso) => curso.nombre)).toEqual(['Angular', 'Spring Boot']);
    expect(fixture.nativeElement.textContent).toContain('Angular');
  });
});
