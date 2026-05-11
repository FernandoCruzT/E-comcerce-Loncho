import { Component, computed, Signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService, CartItem } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent {
  carrito:       Signal<CartItem[]>;
  total        = computed(() => this.carritoService.total());
  cantidadTotal = computed(() => this.carritoService.cantidadTotal());

  constructor(private carritoService: CarritoService) {
    this.carrito = this.carritoService.productos;
  }

  aumentar(id: number): void {
    const item = this.carrito().find(i => i.product.id === id);
    if (item) this.carritoService.agregar(item.product);
  }

  disminuir(id: number): void {
    this.carritoService.quitar(id);
  }

  eliminar(id: number): void {
    this.carritoService.eliminar(id);
  }

  vaciar(): void {
    this.carritoService.vaciar();
  }

  exportarXML(): void {
    this.carritoService.exportarXML();
  }
}
