import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http
      .get('/assets/productos.xml', { responseType: 'text' })
      .pipe(map((xml) => this.parseXml(xml)));
  }

  private parseXml(xmlText: string): Product[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    if (doc.getElementsByTagName('parsererror').length > 0) {
      console.error('Error al parsear XML de productos');
      return [];
    }

    return Array.from(doc.getElementsByTagName('product')).map((node) => ({
      id:          this.getNumber(node, 'id'),
      name:        this.getText(node, 'n'),
      price:       this.getNumber(node, 'price'),
      imageUrl:    this.getText(node, 'imageUrl'),
      category:    this.getText(node, 'category'),
      description: this.getText(node, 'description'),
      inStock:     this.getBool(node, 'inStock'),
    }));
  }

  private getText(el: Element, tag: string): string {
    return el.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
  }
  private getNumber(el: Element, tag: string): number {
    const n = Number(this.getText(el, tag));
    return Number.isFinite(n) ? n : 0;
  }
  private getBool(el: Element, tag: string): boolean {
    const v = this.getText(el, tag).toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }
}
