import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private _productos = signal<Product[]>([]);
  readonly productos = this._productos.asReadonly();

  agregar(producto: Product): void {
    this._productos.update((lista) => [...lista, producto]);
  }

  quitar(id: number): void {
    this._productos.update((lista) => lista.filter((p) => p.id !== id));
  }

  vaciar(): void {
    this._productos.set([]);
  }

  total(): number {
    return this._productos().reduce((acc, p) => acc + p.price, 0);
  }

  cantidadTotal(): number {
    return this._productos().length;
  }

  exportarXML(): void {
    const productos = this._productos();
    if (productos.length === 0) return;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
    xml += `  <tienda>Loncho</tienda>\n`;
    xml += `  <fecha>${new Date().toISOString()}</fecha>\n`;

    for (const p of productos) {
      xml += `  <producto>\n`;
      xml += `    <id>${p.id}</id>\n`;
      xml += `    <nombre>${this.escapeXml(p.name)}</nombre>\n`;
      xml += `    <categoria>${this.escapeXml(p.category)}</categoria>\n`;
      xml += `    <precio>${p.price}</precio>\n`;
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
