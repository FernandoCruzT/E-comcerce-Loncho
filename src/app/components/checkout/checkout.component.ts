import { Component, OnInit, AfterViewInit, OnDestroy, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { PaypalService, CaptureOrderResponse } from '../../services/paypal.service';
import { environment } from '../../../environments/environment';

declare const paypal: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {
  carrito    = computed(() => this.carritoService.productos());
  total      = computed(() => this.carritoService.total());
  cargando   = signal(false);
  error      = signal('');
  pago       = signal<CaptureOrderResponse | null>(null);

  private sdkScript: HTMLScriptElement | null = null;
  private mostrarBotonPaypal = true;

  constructor(
    private carritoService: CarritoService,
    private paypalService: PaypalService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const status = this.route.snapshot.queryParamMap.get('status');
    const token  = this.route.snapshot.queryParamMap.get('token');

    if (status === 'success' && token) {
      this.mostrarBotonPaypal = false;
      this.capturarPago(token);
      return;
    }

    if (status === 'cancel') {
      this.mostrarBotonPaypal = false;
      this.error.set('Pago cancelado. Puedes intentarlo de nuevo.');
      return;
    }
  }

  ngAfterViewInit(): void {
    if (this.mostrarBotonPaypal) {
      this.cargarSDKPayPal();
    }
  }

  ngOnDestroy(): void {
    this.sdkScript?.remove();
  }

  private cargarSDKPayPal(): void {
    if (typeof paypal !== 'undefined') {
      this.renderBoton();
      return;
    }

    this.sdkScript = document.createElement('script');
    this.sdkScript.src = `https://www.paypal.com/sdk/js?client-id=${environment.paypalClientId}&currency=${environment.currency}`;
    this.sdkScript.onload = () => this.renderBoton();
    document.head.appendChild(this.sdkScript);
  }

  private renderBoton(): void {
    const contenedor = document.getElementById('paypal-button-container');
    if (!contenedor) {
      setTimeout(() => this.renderBoton(), 500);
      return;
    }
    if (contenedor.children.length > 0) return;

    paypal.Buttons({
      createOrder: async () => {
        this.cargando.set(true);
        this.error.set('');
        try {
          const items = this.carrito().map((item) => ({
            nombre:   item.product.name,
            cantidad: item.cantidad,
            precio:   item.product.price,
          }));
          const res = await this.paypalService.createOrder(items, this.total());
          return res.orderID;
        } catch (e: any) {
          this.error.set('Error al crear la orden: ' + (e.message || 'Intenta de nuevo'));
          this.cargando.set(false);
          throw e;
        }
      },
      onApprove: async (data: { orderID: string }) => {
        try {
          const capture = await this.paypalService.captureOrder(data.orderID); // SDK siempre provee orderID (D mayúscula)
          this.pago.set(capture);
          this.carritoService.vaciar();
        } catch (e: any) {
          this.error.set('Error al capturar el pago: ' + (e.message || 'Intenta de nuevo'));
        } finally {
          this.cargando.set(false);
        }
      },
      onCancel: () => {
        this.error.set('Pago cancelado. Puedes intentarlo de nuevo.');
        this.cargando.set(false);
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        this.error.set('Ocurrió un error con PayPal. Intenta de nuevo.');
        this.cargando.set(false);
      },
      style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' },
    }).render('#paypal-button-container');
  }

  private async capturarPago(orderID: string): Promise<void> {
    this.cargando.set(true);
    try {
      const capture = await this.paypalService.captureOrder(orderID);
      this.pago.set(capture);
      this.carritoService.vaciar();
    } catch (e: any) {
      this.error.set('Error al confirmar el pago: ' + (e.message || 'Intenta de nuevo'));
    } finally {
      this.cargando.set(false);
    }
  }
}
