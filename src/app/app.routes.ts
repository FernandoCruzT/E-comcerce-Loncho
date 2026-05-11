import { Routes } from '@angular/router';
import { CatalogoComponent }  from './components/catalogo/catalogo.component';
import { CarritoComponent }   from './components/carrito/carrito.component';
import { CheckoutComponent }  from './components/checkout/checkout.component';

export const routes: Routes = [
  { path: '',         component: CatalogoComponent  },
  { path: 'carrito',  component: CarritoComponent   },
  { path: 'checkout', component: CheckoutComponent  },
  { path: '**',       redirectTo: ''                },
];
