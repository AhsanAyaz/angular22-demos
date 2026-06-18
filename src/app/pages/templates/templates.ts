import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Cancelled';

interface CoffeeItem {
  id: number;
  name: string;
  stock: number;
  price: number;
}

@Component({
  selector: 'app-templates',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="card bg-base-100 shadow-xl border border-base-200">
        <div class="card-body">
          <h2 class="card-title text-2xl font-black text-primary">🏹 Template & Compiler Enhancements</h2>
          <p class="text-base-content/70">
            Angular v22 brings multiple ergonomic quality-of-life enhancements to the template parser, making components cleaner, more expressive, and type-safe.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <!-- 1. Switch Improvements -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <h3 class="text-xl font-bold">1. Multi-case & Exhaustive &#64;switch</h3>
            <p class="text-xs text-base-content/60">
              Multiple <code>&#64;case</code> blocks can now share the same outcome without duplication. Adding <code>&#64;default never;</code> ensures union types are checked exhaustively at compile-time.
            </p>

            <div class="flex items-center gap-2 mt-4">
              <span class="text-sm font-semibold">Change Order Status:</span>
              <select 
                [value]="status()" 
                (change)="updateStatus($any($event.target).value)" 
                class="select select-bordered select-sm">
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div class="bg-neutral text-neutral-content p-4 rounded-xl text-xs font-mono my-4">
              <pre>
&#64;let currentStatus = status();
&#64;switch (currentStatus) {{ '{' }}
  &#64;case ('Pending')
  &#64;case ('Processing') {{ '{' }} &lt;p&gt;In Progress&lt;/p&gt; {{ '}' }}
  &#64;case ('Shipped') {{ '{' }} &lt;p&gt;Shipped&lt;/p&gt; {{ '}' }}
  &#64;default never;
{{ '}' }}</pre>
            </div>

            @let currentStatus = status();

            <!-- Demo 1: Multi-case switch -->
            <div class="bg-base-200 p-4 rounded-xl border border-base-300 flex items-center gap-4 mb-2">
              <span class="font-bold text-sm">Multi-case Badge:</span>
              @switch (currentStatus) {
                @case ('Pending')
                @case ('Processing') {
                  <span class="badge badge-info font-semibold">In Progress</span>
                }
                @case ('Shipped') {
                  <span class="badge badge-success font-semibold">On Its Way! (Shipped)</span>
                }
                @default {
                  <span class="badge badge-error font-semibold">Cancelled</span>
                }
              }
            </div>

            <!-- Demo 2: Exhaustive switch -->
            <div class="bg-base-200 p-4 rounded-xl border border-base-300 flex items-center gap-4">
              <span class="font-bold text-sm">Exhaustive Badge:</span>
              @switch (currentStatus) {
                @case ('Pending') {
                  <span class="badge badge-ghost font-semibold">Pending</span>
                }
                @case ('Processing') {
                  <span class="badge badge-ghost font-semibold">Processing</span>
                }
                @case ('Shipped') {
                  <span class="badge badge-ghost font-semibold">Shipped</span>
                }
                @case ('Cancelled') {
                  <span class="badge badge-ghost font-semibold">Cancelled</span>
                }
                @default never;
              }
            </div>
          </div>
        </div>

        <!-- 2. Arrow Functions in Templates -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <h3 class="text-xl font-bold">2. Arrow Functions in Templates</h3>
            <p class="text-xs text-base-content/60">
              You can now author simple inline functions/arrows directly in templates, which is incredibly useful for updating local signal states without writing component methods.
            </p>

            <div class="bg-neutral text-neutral-content p-4 rounded-xl text-xs font-mono my-4">
              <pre>
&lt;button 
  (click)="item.update(p => ({{ '{' }} ...p, stock: p.stock - 1 {{ '}' }}))"&gt;
  Buy Coffee
&lt;/button&gt;</pre>
            </div>

            <div class="bg-base-200 p-4 rounded-xl border border-base-300 flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-bold text-primary">{{ coffeeItem().name }}</span>
                  <span class="text-xs text-base-content/50 ml-2">Stock: {{ coffeeItem().stock }}</span>
                </div>
                <button 
                  (click)="coffeeItem.update(c => ({ ...c, stock: Math.max(0, c.stock - 1) }))" 
                  [disabled]="coffeeItem().stock <= 0" 
                  class="btn btn-primary btn-sm">
                  Buy 1 (Arrow Click)
                </button>
              </div>
              @if (coffeeItem().stock === 0) {
                <span class="text-error text-xs font-bold">Sold Out! Reset stock below.</span>
              }
              <button 
                (click)="coffeeItem.set({ id: 1, name: 'Espresso Macchiato', stock: 5, price: 3.5 })" 
                class="btn btn-outline btn-xs mt-2 self-end">
                Reset Stock
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Spread & Rest in Templates -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <h3 class="text-xl font-bold">3. Spread Syntax in Template Bindings</h3>
            <p class="text-xs text-base-content/60">
              Spread and rest operators work with objects, arrays, and function calls inside templates. Cleanly compose style objects or array parameters.
            </p>

            <div class="flex items-center gap-2 mt-2">
              <span class="text-sm font-semibold">Elevate & Highlight card:</span>
              <input type="checkbox" [checked]="isElevated()" (change)="isElevated.set($any($event.target).checked)" class="checkbox checkbox-primary" />
            </div>

            <div class="bg-neutral text-neutral-content p-4 rounded-xl text-xs font-mono my-4">
              <pre>
&lt;div [class]="{{ '{' }}
  ...baseCardStyles,
  'border-base-300': !isElevated(),
  'border-2': isElevated(),
  'border-primary': isElevated(),
  'bg-primary/20': isElevated(),
  'shadow-2xl': isElevated(),
  'shadow-primary/50': isElevated(),
  'scale-105': isElevated()
{{ '}' }}"&gt;</pre>
            </div>

            <div class="bg-base-200 p-8 rounded-xl border border-base-300 flex justify-center items-center">
              <div 
                [class]="{
                  ...baseCardStyles,
                  'border-base-300': !isElevated(),
                  'border-2': isElevated(),
                  'border-primary': isElevated(),
                  'bg-primary/20': isElevated(),
                  'shadow-2xl': isElevated(),
                  'shadow-primary/50': isElevated(),
                  'scale-105': isElevated()
                }">
                <p class="font-bold text-sm">Dynamic Styling Output</p>
                <p class="text-xs mt-1">This box merges styles using object spread syntax.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Comments in Elements -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <h3 class="text-xl font-bold">4. Comments inside Element Declarations</h3>
            <p class="text-xs text-base-content/60">
              HTML elements can now contain comments directly at the property and binding level. Great for documentation and code explanation directly in templates.
            </p>

            <div class="bg-neutral text-neutral-content p-4 rounded-xl text-xs font-mono my-4">
              <pre>
&lt;div 
  // Base background class
  class="p-4 bg-base-200"
  /* Border styles for preview */
  class="border"&gt;
&lt;/div&gt;</pre>
            </div>

            <div class="bg-base-200 p-4 rounded-xl border border-base-300">
              <div 
                // Inline comments inside the element declaration are now successfully parsed!
                /* This multiline comment inside the HTML opening element tag
                   is completely ignored by the compiler instead of causing errors */
                class="p-4 bg-primary text-primary-content rounded-xl font-bold text-center">
                Check code: Element-level comments compiled successfully!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TemplatesComponent {
  status = signal<OrderStatus>('Pending');

  coffeeItem = signal<CoffeeItem>({
    id: 1,
    name: 'Espresso Macchiato',
    stock: 5,
    price: 3.5
  });

  isElevated = signal(false);

  baseCardStyles = {
    'p-4': true,
    'rounded-xl': true,
    'border': true,
    'border-base-300': true,
    'transition-all': true,
    'duration-300': true
  };

  protected readonly Math = Math;

  updateStatus(newStatus: OrderStatus) {
    this.status.set(newStatus);
  }
}
