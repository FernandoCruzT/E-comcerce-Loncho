import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent implements OnInit, OnDestroy {
  mensaje = signal('');
  visible = signal(false);

  private sub?: Subscription;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.mensaje$.subscribe(nombre => {
      if (this.timer) clearTimeout(this.timer);
      this.mensaje.set(nombre);
      this.visible.set(true);
      this.timer = setTimeout(() => this.visible.set(false), 2500);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.timer) clearTimeout(this.timer);
  }
}
