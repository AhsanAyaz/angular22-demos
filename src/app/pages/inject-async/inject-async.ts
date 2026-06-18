import { Component, inject, injectAsync, signal } from '@angular/core';
import { EagerCalcService } from '../../services/eager-calc';

@Component({
  selector: 'app-inject-async',
  template: `
    <div class="flex flex-col gap-6">
      <div class="card bg-base-100 shadow-xl border border-base-200">
        <div class="card-body">
          <h2 class="card-title text-2xl font-black text-primary">⚡ injectAsync (Asynchronous Dependency Injection)</h2>
          <p class="text-base-content/70">
            Angular v22 introduces <code>injectAsync</code> which enables code-splitting at the service layer.
            Instead of loading large services eagerly during application bootstrap or route loading, services can now be loaded on-demand.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <!-- Before Card: Eager DI -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <span class="badge badge-error gap-2 self-start font-semibold">Before (Eager DI)</span>
            <h3 class="text-xl font-bold mt-2">Traditional Synchronous Injection</h3>
            <p class="text-sm text-base-content/60">
              The service is imported eagerly at the top of the file and bundled into the main/chunk assets, even if the user never clicks the calculate button.
            </p>

            <div class="bg-neutral text-neutral-content p-4 rounded-xl text-xs font-mono my-4">
              <pre>
import {{ '{' }} EagerCalcService {{ '}' }} from './eager-calc';

export class ReportComponent {{ '{' }}
  private eagerCalc = inject(EagerCalcService);

  calculate() {{ '{' }}
    this.result = this.eagerCalc.calculateFibonacci(25);
  {{ '}' }}
{{ '}' }}</pre>
            </div>

            <div class="flex flex-col gap-4 mt-auto">
              <div class="flex gap-4 items-center">
                <button (click)="runEagerCalculation()" class="btn btn-outline btn-error">
                  Run Eager Calculation
                </button>
                @if (eagerResult() !== null) {
                  <span class="text-sm font-semibold">Result: <span class="text-error font-mono">{{ eagerResult() }}</span></span>
                }
              </div>
              <div class="text-xs text-base-content/50">
                Status: Bundled eagerly during initial compilation.
              </div>
            </div>
          </div>
        </div>

        <!-- After Card: Lazy DI -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <span class="badge badge-success gap-2 self-start font-semibold">After (Lazy DI)</span>
            <h3 class="text-xl font-bold mt-2">Asynchronous injectAsync</h3>
            <p class="text-sm text-base-content/60">
              The service is dynamic-imported and loaded asynchronously only when the button is clicked. The code is split into a separate bundle automatically.
            </p>

            <div class="bg-neutral text-neutral-content p-4 rounded-xl text-xs font-mono my-4">
              <pre>
import {{ '{' }} injectAsync {{ '}' }} from '&#64;angular/core';

export class ReportComponent {{ '{' }}
  private lazyCalc = injectAsync(() => 
    import('./heavy-calc').then(m => m.HeavyCalcService)
  );

  async calculate() {{ '{' }}
    const calc = await this.lazyCalc();
    this.result = calc.calculateFibonacci(25);
  {{ '}' }}
{{ '}' }}</pre>
            </div>

            <div class="flex flex-col gap-4 mt-auto">
              <div class="flex gap-4 items-center flex-wrap">
                <button 
                  (click)="runLazyCalculation()" 
                  [disabled]="isLoading()"
                  class="btn btn-primary">
                  @if (isLoading()) {
                    <span class="loading loading-spinner"></span> Loading Bundle...
                  } @else {
                    Run Lazy Calculation
                  }
                </button>
                @if (lazyResult() !== null) {
                  <span class="text-sm font-semibold">Result: <span class="text-success font-mono">{{ lazyResult() }}</span></span>
                }
              </div>
              <div class="text-xs text-base-content/50 flex flex-col gap-1">
                @if (loadTimeMs() !== null) {
                  <div>Bundle load & instantiate time: <span class="text-success font-bold font-mono">{{ loadTimeMs() }} ms</span></div>
                }
                <div>Status: Loaded dynamically on-demand.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: []
})
export class InjectAsyncComponent {
  private eagerCalc = inject(EagerCalcService);
  private lazyCalc = injectAsync(() => import('../../services/heavy-calc').then(m => m.HeavyCalcService));

  eagerResult = signal<number | null>(null);
  lazyResult = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  loadTimeMs = signal<number | null>(null);

  runEagerCalculation() {
    this.eagerResult.set(this.eagerCalc.calculateFibonacci(25));
  }

  async runLazyCalculation() {
    this.isLoading.set(true);
    const start = performance.now();
    
    const calc = await this.lazyCalc();
    
    const end = performance.now();
    this.loadTimeMs.set(Math.round(end - start));
    
    this.lazyResult.set(calc.calculateFibonacci(25));
    this.isLoading.set(false);
  }
}
