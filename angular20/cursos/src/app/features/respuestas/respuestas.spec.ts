import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestasPage } from './pages/respuestas.page';

describe('RespuestasPage', () => {
  let component: RespuestasPage;
  let fixture: ComponentFixture<RespuestasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RespuestasPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RespuestasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
