import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DossierListComponent } from './features/dossiers/dossier-list.component';
import { DossierDetailComponent } from './features/dossiers/dossier-detail.component';
import { DossierFormComponent } from './features/dossiers/dossier-form.component';
import { LoginComponent } from './features/auth/login.component';
import { MouvementsComponent } from './features/admin/mouvements.component';
import { LocalisationsComponent } from './features/admin/localisations.component';
import { DocumentsComponent } from './features/admin/documents.component';
import { UtilisateursComponent } from './features/admin/utilisateurs.component';
import { CanevasExcelComponent } from './features/admin/canevas-excel.component';
import { ParametresComponent } from './features/admin/parametres.component';

export const routes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  { path: 'connexion', component: LoginComponent, title: 'Connexion — Espace d’administration DU' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Tableau de bord — DU' },
      { path: 'dossiers', component: DossierListComponent, title: 'Dossiers — DU' },
      { path: 'dossiers/nouveau', component: DossierFormComponent, title: 'Nouveau dossier — DU' },
      { path: 'dossiers/:id', component: DossierDetailComponent, title: 'Détail dossier — DU' },
      {
        path: 'dossiers/:id/modifier',
        component: DossierFormComponent,
        title: 'Modifier dossier — DU',
      },
      { path: 'mouvements', component: MouvementsComponent, title: 'Mouvements — DU' },
      { path: 'localisations', component: LocalisationsComponent, title: 'Localisations — DU' },
      { path: 'documents', component: DocumentsComponent, title: 'Documents — DU' },
      { path: 'utilisateurs', component: UtilisateursComponent, title: 'Utilisateurs — DU' },
      { path: 'canevas-excel', component: CanevasExcelComponent, title: 'Canevas Excel — DU' },
      { path: 'parametres', component: ParametresComponent, title: 'Paramètres — DU' },
    ],
  },
  { path: '**', redirectTo: 'connexion' },
];


