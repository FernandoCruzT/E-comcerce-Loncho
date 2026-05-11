import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

interface ProductoApi {
  id:          number;
  nombre:      string;
  precio:      number;
  image_url:   string;
  categoria:   string;
  descripcion: string;
  en_stock:    boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http
      .get<ProductoApi[]>(this.apiUrl)
      .pipe(map((items) => items.map((p) => this.mapToProduct(p))));
  }

  private mapToProduct(p: ProductoApi): Product {
    return {
      id:          p.id,
      name:        p.nombre,
      price:       Number(p.precio),
      imageUrl:    p.image_url,
      category:    p.categoria,
      description: p.descripcion,
      inStock:     p.en_stock,
    };
  }
}
