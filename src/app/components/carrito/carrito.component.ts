import { Component, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { Signal } from '@angular/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent {
  carrito: Signal<Product[]>;
  total   = computed(() => this.carritoService.total());

  constructor(private carritoService: CarritoService) {
    this.carrito = this.carritoService.productos;
  }

  quitar(id: number): void {
    this.carritoService.quitar(id);
  }

  vaciar(): void {
    this.carritoService.vaciar();
  }

  exportarXML(): void {
    this.carritoService.exportarXML();
  }
}
