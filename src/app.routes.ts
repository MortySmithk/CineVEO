import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component.ts').then(m => m.HomeComponent),
    title: 'CineVEO - Assista a Séries de TV e Filmes Online Grátis'
  },
  {
    path: 'filmes',
    loadComponent: () => import('./components/catalog/catalog.component.ts').then(m => m.CatalogComponent),
    data: { type: 'movie', title: 'Filmes' },
    title: 'Filmes - CineVEO'
  },
  {
    path: 'series',
    loadComponent: () => import('./components/catalog/catalog.component.ts').then(m => m.CatalogComponent),
    data: { type: 'tv', title: 'Séries' },
    title: 'Séries - CineVEO'
  },
  {
    path: 'animacoes',
    loadComponent: () => import('./components/catalog/catalog.component.ts').then(m => m.CatalogComponent),
    data: { type: 'movie', title: 'Animações', genreId: 16 },
    title: 'Animações - CineVEO'
  },
  {
    path: 'novelas',
    loadComponent: () => import('./components/catalog/catalog.component.ts').then(m => m.CatalogComponent),
    data: { type: 'tv', title: 'Novelas', genreId: 10766 },
    title: 'Novelas - CineVEO'
  },
  {
    path: 'genre/:id/:name',
    loadComponent: () => import('./components/catalog/catalog.component.ts').then(m => m.CatalogComponent),
    title: 'Gênero - CineVEO'
  },
  {
    path: 'media/:type/:id',
    loadComponent: () => import('./components/media-detail/media-detail.component.ts').then(m => m.MediaDetailComponent),
  },
  {
    path: 'busca/:query',
    loadComponent: () => import('./components/catalog/catalog.component.ts').then(m => m.CatalogComponent)
  },
  {
    path: 'pesquisar',
    loadComponent: () => import('./components/search/search.component.ts').then(m => m.SearchComponent),
    title: 'Pesquisar - CineVEO'
  },
  {
    path: 'perfil',
    loadComponent: () => import('./components/profile/profile.component.ts').then(m => m.ProfileComponent),
    title: 'Meu Perfil - CineVEO'
  },
  {
    path: 'premium',
    loadComponent: () => import('./components/premium/premium.component.ts').then(m => m.PremiumComponent),
    title: 'Premium - CineVEO'
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component.ts').then(m => m.AdminComponent),
    title: 'Admin - CineVEO'
  },
  {
    path: 'player',
    loadComponent: () => import('./components/player/player.component.ts').then(m => m.PlayerComponent),
    title: 'Player - CineVEO'
  },
  { 
    path: '**', 
    redirectTo: '', 
    pathMatch: 'full' 
  }
];
