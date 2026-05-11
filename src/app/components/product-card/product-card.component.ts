import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add    = new EventEmitter<Product>();
  @Output() remove = new EventEmitter<Product>();

  cantidad = signal(0);

  aumentar(): void {
    this.cantidad.update(n => n + 1);
    this.add.emit(this.product);
  }

  disminuir(): void {
    if (this.cantidad() === 0) return;
    this.cantidad.update(n => n - 1);
    this.remove.emit(this.product);
  }
}
