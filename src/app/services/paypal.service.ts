import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateOrderResponse {
  orderID: string;
  approvalUrl: string;
}

export interface CaptureOrderResponse {
  status: string;
  orderID: string;
  payerEmail: string;
  amount: { currency_code: string; value: string };
}

@Injectable({ providedIn: 'root' })
export class PaypalService {
  private readonly apiUrl = `${environment.apiUrl}/paypal`;

  constructor(private http: HttpClient) {}

  createOrder(items: any[], total: number): Promise<CreateOrderResponse> {
    return firstValueFrom(
      this.http.post<CreateOrderResponse>(`${this.apiUrl}/create-order`, { items, total })
    );
  }

  captureOrder(orderId: string): Promise<CaptureOrderResponse> {
    return firstValueFrom(
      this.http.post<CaptureOrderResponse>(`${this.apiUrl}/capture-order`, { orderId })
    );
  }
}
