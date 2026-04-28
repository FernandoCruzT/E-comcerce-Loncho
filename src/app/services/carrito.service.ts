import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  product:  Product;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private _productos = signal<CartItem[]>([]);
  readonly productos = this._productos.asReadonly();

  agregar(producto: Product): void {
    const idx = this._productos().findIndex(i => i.product.id === producto.id);
    if (idx >= 0) {
      this._productos.update(l =>
        l.map((i, j) => j === idx ? { ...i, cantidad: i.cantidad + 1 } : i)
      );
    } else {
      this._productos.update(l => [...l, { product: producto, cantidad: 1 }]);
    }
  }

  quitar(id: number): void {
    const idx = this._productos().findIndex(i => i.product.id === id);
    if (idx < 0) return;
    if (this._productos()[idx].cantidad > 1) {
      this._productos.update(l =>
        l.map((i, j) => j === idx ? { ...i, cantidad: i.cantidad - 1 } : i)
      );
    } else {
      this._productos.update(l => l.filter(i => i.product.id !== id));
    }
  }

  eliminar(id: number): void {
    this._productos.update(l => l.filter(i => i.product.id !== id));
  }

  vaciar(): void {
    this._productos.set([]);
  }

  total(): number {
    return this._productos().reduce((acc, i) => acc + i.product.price * i.cantidad, 0);
  }

  cantidadTotal(): number {
    return this._productos().reduce((acc, i) => acc + i.cantidad, 0);
  }

  exportarXML(): void {
    const items = this._productos();
    if (items.length === 0) return;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
    xml += `  <tienda>Loncho</tienda>\n`;
    xml += `  <fecha>${new Date().toISOString()}</fecha>\n`;

    for (const { product: p, cantidad } of items) {
      xml += `  <producto>\n`;
      xml += `    <id>${p.id}</id>\n`;
      xml += `    <nombre>${this.escapeXml(p.name)}</nombre>\n`;
      xml += `    <categoria>${this.escapeXml(p.category)}</categoria>\n`;
      xml += `    <precio>${p.price}</precio>\n`;
      xml += `    <cantidad>${cantidad}</cantidad>\n`;
      xml += `    <subtotal>${p.price * cantidad}</subtotal>\n`;
      xml += `    <descripcion>${this.escapeXml(p.description)}</descripcion>\n`;
      xml += `  </producto>\n`;
    }

    xml += `  <total>${this.total()}</total>\n`;
    xml += `</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `recibo-loncho-${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeXml(v: string): string {
    return v
      .replaceAll('&',  '&amp;')
      .replaceAll('<',  '&lt;')
      .replaceAll('>',  '&gt;')
      .replaceAll('"',  '&quot;')
      .replaceAll("'",  '&apos;');
  }
}
