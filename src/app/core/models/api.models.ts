export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
}

export interface UserResponse {
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
}

export interface Cliente {
  id: number;
  documento: string;
  nombres: string;
  telefono: string;
}

export interface Servicio {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
}

export interface ServicioRequest {
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
}

export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteId: number;
  clienteNombre: string;
}

export interface VehiculoRequest {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteId: number;
}

export interface DetalleOrden {
  id: number;
  servicioId: number;
  codigo: string;
  servicio: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Orden {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  placa: string;
  clienteNombre: string;
  kilometraje: number;
  estado: 'REGISTRADA' | 'ANULADA';
  total: number;
  usuarioRegistro: string;
  motivoAnulacion: string | null;
  detalles: DetalleOrden[];
}

export interface OrdenRequest {
  vehiculoId: number;
  kilometraje: number;
  detalles: { servicioId: number; cantidad: number }[];
}

export interface IngresoServicio {
  codigo: string;
  servicio: string;
  cantidadTotal: number;
  importeTotal: number;
}

export interface ApiErrorResponse {
  status?: number;
  mensaje?: string;
  campos?: Record<string, string>;
}

export interface AuthSession extends LoginResponse {
  username: string;
  expiraEn: number;
}
