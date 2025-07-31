
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GioiThieuComponent } from './components/gioi-thieu/gioi-thieu.component';
import { PhimMoiComponent } from './components/home/main-container/phim-moi/phim-moi.component';
import { PhimBoComponent } from './components/home/main-container/phim-bo/phim-bo.component';
import { PhimLeComponent } from './components/home/main-container/phim-le/phim-le.component';
import { LienHeComponent } from './components/lien-he/lien-he.component';
import { ErrorComponent } from './components/error/error.component';
import { SearchResultComponent } from './components/main-search/search-result/search-result.component';
import { MovieDetailComponent } from './components/movie/movie-detail/movie-detail.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { NonAuthGuard } from './guards/non-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { FavoriteMoviesComponent } from './components/favorite-movies/favorite-movies.component';
import { WatchLaterComponent } from './components/watch-later/watch-later.component';
import { ViewHistoryComponent } from './components/view-history/view-history.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminGuard } from './guards/admin.guard';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'search',
    component: SearchResultComponent,
    data: { title: 'Tìm kiếm' }
  },
  {
    path: 'phim-moi',
    component: SearchResultComponent,
    data: { type: '', title: 'Phim Mới' }
  },
  {
    path: 'phim-bo',
    component: SearchResultComponent,
    data: { type: 'phim-bo', title: 'Phim Bộ' }
  },
  {
    path: 'phim-le',
    component: SearchResultComponent,
    data: { type: 'phim-le', title: 'Phim Lẻ' }
  },
  {
    path: 'hoat-hinh',
    component: SearchResultComponent,
    data: { type: 'hoat-hinh', title: 'Hoạt Hình' }
  },
  {
    path: 'phim/:slug',
    component: MovieDetailComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NonAuthGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NonAuthGuard]
  },
  { path: 'lien-he', component: LienHeComponent ,canActivate: [AuthGuard]},
  { path: 'gioi-thieu', component: GioiThieuComponent },
  { path: 'yeu-thich', component: FavoriteMoviesComponent ,canActivate: [AuthGuard]},
  {
    path: 'lich-su',
    component: ViewHistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'xem-sau',
    component: WatchLaterComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
    data: {
      permissions: ['FULL_CONTROL']
    }
  },
  {
    path: 'xem-sau/:userId',
    component: WatchLaterComponent,
    canActivate: [AuthGuard, AdminGuard]
  }
,
{
  path: 'yeu-thich/:userId',
  component: FavoriteMoviesComponent,
  canActivate: [AuthGuard, AdminGuard]
},
{
  path: 'lich-su/:userId',
  component: ViewHistoryComponent,
  canActivate: [AuthGuard, AdminGuard]
},
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', component: ErrorComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutesModule { }
