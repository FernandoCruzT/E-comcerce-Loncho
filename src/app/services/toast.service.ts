import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _mensaje$ = new Subject<string>();
  readonly mensaje$ = this._mensaje$.asObservable();

  mostrar(mensaje: string): void {
    this._mensaje$.next(mensaje);
  }
}
