import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Cliente,
  ApiErrorResponse,
  IngresoServicio,
  LoginResponse,
  Orden,
  OrdenRequest,
  Servicio,
  ServicioRequest,
  Vehiculo,
  VehiculoRequest,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.url}/auth/login`, { username, password });
  }

  servicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.url}/servicios`);
  }

  crearServicio(request: ServicioRequest): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.url}/servicios`, request);
  }

  actualizarServicio(id: number, request: ServicioRequest): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.url}/servicios/${id}`, request);
  }

  cambiarEstadoServicio(id: number, activo: boolean): Observable<Servicio> {
    return this.http.patch<Servicio>(`${this.url}/servicios/${id}/estado`, { activo });
  }

  eliminarServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/servicios/${id}`);
  }

  clientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.url}/clientes`);
  }

  vehiculos(clienteId?: number): Observable<Vehiculo[]> {
    let params = new HttpParams();
    if (clienteId !== undefined) params = params.set('clienteId', clienteId);
    return this.http.get<Vehiculo[]>(`${this.url}/vehiculos`, { params });
  }

  crearVehiculo(request: VehiculoRequest): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(`${this.url}/vehiculos`, request);
  }

  actualizarVehiculo(id: number, request: VehiculoRequest): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.url}/vehiculos/${id}`, request);
  }

  eliminarVehiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/vehiculos/${id}`);
  }

  ordenes(filters: Record<string, string>): Observable<Orden[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value.trim()) params = params.set(key, value.trim());
    }
    return this.http.get<Orden[]>(`${this.url}/ordenes`, { params });
  }

  orden(id: number): Observable<Orden> {
    return this.http.get<Orden>(`${this.url}/ordenes/${id}`);
  }

  crearOrden(request: OrdenRequest): Observable<Orden> {
    return this.http.post<Orden>(`${this.url}/ordenes`, request);
  }

  anularOrden(id: number, motivo: string): Observable<Orden> {
    return this.http.patch<Orden>(`${this.url}/ordenes/${id}/anular`, { motivo });
  }

  ingresos(desde: string, hasta: string): Observable<IngresoServicio[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<IngresoServicio[]>(
      `${this.url}/reportes/ingresos-por-servicio`,
      { params },
    );
  }

  mensaje(error: unknown): string {
    const body = error instanceof HttpErrorResponse ? error.error : null;
    return isApiErrorResponse(body) && body.mensaje
      ? body.mensaje
      : 'No se pudo completar la operación. Inténtalo nuevamente.';
  }

  erroresCampos(error: unknown): Record<string, string> {
    const body = error instanceof HttpErrorResponse ? error.error : null;
    return isApiErrorResponse(body) ? body.campos ?? {} : {};
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) return false;
  const body = value as Record<string, unknown>;
  const fields = body['campos'];
  return (
    (body['mensaje'] === undefined || typeof body['mensaje'] === 'string') &&
    (fields === undefined ||
      (typeof fields === 'object' &&
        fields !== null &&
        Object.values(fields).every((message) => typeof message === 'string')))
  );
}
