import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'servicios',
        canActivate: [permissionGuard],
        data: { permission: 'SERVICIO_LEER' },
        loadComponent: () => import('./pages/servicios/servicios.page').then((m) => m.ServiciosPage),
      },
      {
        path: 'vehiculos',
        canActivate: [permissionGuard],
        data: { permission: 'VEHICULO_LEER' },
        loadComponent: () => import('./pages/vehiculos/vehiculos.page').then((m) => m.VehiculosPage),
      },
      {
        path: 'ordenes',
        canActivate: [permissionGuard],
        data: { permission: 'ORDEN_LEER' },
        loadComponent: () => import('./pages/ordenes/ordenes.page').then((m) => m.OrdenesPage),
      },
      {
        path: 'ordenes/nueva',
        canActivate: [permissionGuard],
        data: { permission: 'ORDEN_REGISTRAR' },
        loadComponent: () => import('./pages/orden-nueva/orden-nueva.page').then((m) => m.OrdenNuevaPage),
      },
      {
        path: 'reportes',
        canActivate: [permissionGuard],
        data: { permission: 'REPORTE_VER' },
        loadComponent: () => import('./pages/reportes/reportes.page').then((m) => m.ReportesPage),
      },
      {
        path: 'acceso-denegado',
        loadComponent: () => import('./pages/acceso-denegado/acceso-denegado.page').then((m) => m.AccesoDenegadoPage),
      },
      {
        path: '**',
        loadComponent: () => import('./pages/no-encontrado/no-encontrado.page').then((m) => m.NoEncontradoPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
