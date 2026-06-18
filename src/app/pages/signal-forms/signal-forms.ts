import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';

@Component({
  selector: 'app-signal-forms',
  imports: [CommonModule, ReactiveFormsModule, FormField],
  template: `
    <div class="flex flex-col gap-6">
      <div class="card bg-base-100 shadow-xl border border-base-200">
        <div class="card-body">
          <h2 class="card-title text-2xl font-black text-primary">📋 Signal Forms (Stable Form State Management)</h2>
          <p class="text-base-content/70">
            Angular v22 stabilizes experimental Signal Forms. It provides a type-safe, declarative, and highly reactive form state management system directly integrated with Signals, eliminating <code>ControlValueAccessor</code> boilerplate for custom components.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <!-- Before Card: Reactive Forms -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <span class="badge badge-error gap-2 self-start font-semibold">Before (Reactive Forms)</span>
            <h3 class="text-xl font-bold mt-2">Traditional FormGroup & FormBuilder</h3>
            <p class="text-sm text-base-content/60">
              Form controls must be explicitly declared, validations are attached via non-type-safe arrays, and checking dirty/touched status is verbose.
            </p>

            <form [formGroup]="traditionalForm" (ngSubmit)="submitTraditional()" class="space-y-4 my-4">
              <div class="form-control w-full">
                <label class="label"><span class="label-text font-bold">Email Address</span></label>
                <input 
                  type="email" 
                  formControlName="email" 
                  placeholder="name@example.com" 
                  class="input input-bordered w-full"
                  [class.input-error]="traditionalForm.get('email')?.invalid && traditionalForm.get('email')?.touched" />
                @if (traditionalForm.get('email')?.invalid && traditionalForm.get('email')?.touched) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (traditionalForm.get('email')?.errors?.['required']) { Email is required }
                      @if (traditionalForm.get('email')?.errors?.['email']) { Must be a valid email }
                    </span>
                  </label>
                }
              </div>

              <div class="form-control w-full">
                <label class="label"><span class="label-text font-bold">Password</span></label>
                <input 
                  type="password" 
                  formControlName="password" 
                  placeholder="••••••••" 
                  class="input input-bordered w-full"
                  [class.input-error]="traditionalForm.get('password')?.invalid && traditionalForm.get('password')?.touched" />
                @if (traditionalForm.get('password')?.invalid && traditionalForm.get('password')?.touched) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (traditionalForm.get('password')?.errors?.['required']) { Password is required }
                      @if (traditionalForm.get('password')?.errors?.['minlength']) { Minimum 6 characters required }
                    </span>
                  </label>
                }
              </div>

              <button 
                type="submit" 
                [disabled]="traditionalForm.invalid" 
                class="btn btn-outline btn-error w-full mt-4">
                Submit (Reactive Form)
              </button>
            </form>

            @if (traditionalSubmitted()) {
              <div class="alert alert-success mt-2">
                <span>Traditional Form submitted with: {{ traditionalValues() | json }}</span>
              </div>
            }
          </div>
        </div>

        <!-- After Card: Signal Forms -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <span class="badge badge-success gap-2 self-start font-semibold">After (Signal Forms)</span>
            <h3 class="text-xl font-bold mt-2">Declarative schema form()</h3>
            <p class="text-sm text-base-content/60">
              Form model is a signal. Schema-based validations are declared cleanly. Template uses type-safe properties directly.
            </p>

            <form class="space-y-4 my-4" (submit)="$event.preventDefault(); submitSignal()">
              <div class="form-control w-full">
                <label class="label"><span class="label-text font-bold">Email Address</span></label>
                <input 
                  type="email" 
                  [formField]="f.email" 
                  placeholder="name@example.com" 
                  class="input input-bordered w-full"
                  [class.input-error]="f.email().invalid() && f.email().touched()" />
                @if (f.email().invalid() && f.email().touched()) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @for (err of f.email().errors(); track err.kind) {
                        <span>{{ err.message }}</span>
                      }
                    </span>
                  </label>
                }
              </div>

              <div class="form-control w-full">
                <label class="label"><span class="label-text font-bold">Password</span></label>
                <input 
                  type="password" 
                  [formField]="f.password" 
                  placeholder="••••••••" 
                  class="input input-bordered w-full"
                  [class.input-error]="f.password().invalid() && f.password().touched()" />
                @if (f.password().invalid() && f.password().touched()) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @for (err of f.password().errors(); track err.kind) {
                        <span>{{ err.message }}</span>
                      }
                    </span>
                  </label>
                }
              </div>

              <button 
                type="submit" 
                [disabled]="f().invalid()" 
                class="btn btn-primary w-full mt-4">
                Submit (Signal Form)
              </button>
            </form>

            @if (signalSubmitted()) {
              <div class="alert alert-success mt-2">
                <span>Signal Form submitted with: {{ credentials() | json }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class SignalFormsComponent {
  // Traditional Reactive Form
  private fb = inject(FormBuilder);
  traditionalForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  traditionalSubmitted = signal(false);
  traditionalValues = signal<unknown>(null);

  submitTraditional() {
    this.traditionalSubmitted.set(true);
    this.traditionalValues.set(this.traditionalForm.value);
  }

  // Signal Form
  credentials = signal({
    email: '',
    password: ''
  });

  f = form(this.credentials, schema => {
    required(schema.email, { message: 'Email address is required' });
    email(schema.email, { message: 'Must be a valid email format' });
    required(schema.password, { message: 'Password is required' });
    minLength(schema.password, 6, { message: 'Password must be at least 6 characters long' });
  });

  signalSubmitted = signal(false);

  submitSignal() {
    this.signalSubmitted.set(true);
  }
}
