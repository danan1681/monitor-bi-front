export const TelefonosRoutes = [
  {
    path: '',
    loadComponent: () => import('./telefonos.component').then(m => m.TelefonosComponent),
    data: {
      title: 'MENSAJERÍA',
    }
  }
]
