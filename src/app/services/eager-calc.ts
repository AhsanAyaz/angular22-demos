import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EagerCalcService {
  calculateFibonacci(n: number): number {
    if (n <= 1) return n;
    return this.calculateFibonacci(n - 1) + this.calculateFibonacci(n - 2);
  }
}
