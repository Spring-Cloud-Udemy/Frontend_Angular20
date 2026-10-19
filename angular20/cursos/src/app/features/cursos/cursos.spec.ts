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
    crear: jasmine.createSpy('crear').and.callFake((curso: { nombre: string }) =>
      of({ id: 3, ...curso }),
    ),
    editar: jasmine.createSpy('editar').and.callFake((_id: number, curso: { nombre: string }) =>
      of({ id: 1, ...curso }),
    ),
    eliminar: jasmine.createSpy('eliminar').and.returnValue(of(undefined)),
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

  it('selects a course and enables the global course actions', () => {
    component.seleccionarCurso(component.cursos()[0]);
    fixture.detectChanges();

    expect(component.selectedCurso()?.nombre).toBe('Angular');
    const actions = fixture.nativeElement.querySelectorAll('.header-actions button');
    expect(actions[0].disabled).toBeFalse();
    expect(actions[1].disabled).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Curso seleccionado: Angular');
  });

  it('creates a course and adds the response to the catalog', () => {
    component.openCreate();
    component.cursoForm.controls.nombre.setValue('  Matemáticas  ');

    component.crearCurso();

    expect(cursosService.crear).toHaveBeenCalledWith({ nombre: 'Matemáticas' });
    expect(component.cursos()[0]).toEqual({ id: 3, nombre: 'Matemáticas' });
    expect(component.createOpen()).toBeFalse();
    expect(component.notice()).toBe('El curso se creó correctamente.');
  });

  it('updates the selected course from the catalog actions', () => {
    component.seleccionarCurso(component.cursos()[0]);
    component.openEdit();
    component.cursoForm.controls.nombre.setValue('Angular avanzado');

    component.guardarCurso();

    expect(cursosService.editar).toHaveBeenCalledWith(1, {
      id: 1,
      nombre: 'Angular avanzado',
    });
    expect(component.cursos()[0].nombre).toBe('Angular avanzado');
    expect(component.selectedCurso()?.nombre).toBe('Angular avanzado');
    expect(component.createOpen()).toBeFalse();
  });

  it('deletes the selected course and clears the selection', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.seleccionarCurso(component.cursos()[0]);

    component.eliminarCurso();

    expect(cursosService.eliminar).toHaveBeenCalledWith(1);
    expect(component.cursos().map((curso) => curso.id)).toEqual([2]);
    expect(component.selectedCurso()).toBeNull();
    expect(component.notice()).toBe('El curso se eliminó correctamente.');
  });
});
