import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from './page';

export abstract class CommonService<E> {
  constructor(
    protected http: HttpClient,
    protected baseEndpoint: string
  ) {}

  // GET /
  listar(): Observable<E[]> {
    return this.http.get<E[]>(this.baseEndpoint);
  }

  // GET /pagina?page=0&size=5&sort=id,asc
  listarPaginas(page: number, size: number, sort = 'id,asc'): Observable<Page<E>> {
    return this.http.get<Page<E>>(
      `${this.baseEndpoint}/pagina?page=${page}&size=${size}&sort=${sort}`
    );
  }

  // GET /{id}
  ver(id: number): Observable<E> {
    return this.http.get<E>(`${this.baseEndpoint}/${id}`);
  }

  // POST /  (201 con la entidad creada, 400 con el mapa de errores)
  crear(e: E): Observable<E> {
    return this.http.post<E>(this.baseEndpoint, e);
  }

  // PUT /{id}  (lo define cada controller hijo, no el CommonController)
  editar(id: number, e: E): Observable<E> {
    return this.http.put<E>(`${this.baseEndpoint}/${id}`, e);
  }

  // DELETE /{id}  (204 sin body)
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseEndpoint}/${id}`);
  }
}