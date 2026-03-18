import { Component, computed, signal } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductsService } from '../../services/product.service';
import { CarritoService } from '../../services/carrito.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent {
  products      = signal<Product[]>([]);
  categoriaActiva = signal<string>('Todos');

  categorias = computed(() => {
    const cats = this.products().map((p) => p.category);
    return ['Todos', ...new Set(cats)];
  });

  productosFiltrados = computed(() => {
    const cat = this.categoriaActiva();
    return cat === 'Todos'
      ? this.products()
      : this.products().filter((p) => p.category === cat);
  });

  inStockCount = computed(
    () => this.products().filter((p) => p.inStock).length
  );

  constructor(
    private productsService: ProductsService,
    private carritoService: CarritoService
  ) {
    this.productsService.getAll().subscribe({
      next:  (data) => this.products.set(data),
      error: (err)  => console.error('Error cargando productos:', err),
    });
  }

  filtrar(cat: string): void {
    this.categoriaActiva.set(cat);
  }

  agregar(producto: Product): void {
    this.carritoService.agregar(producto);
  }
}
