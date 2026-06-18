import { Component, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-http-resource',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="card bg-base-100 shadow-xl border border-base-200">
        <div class="card-body">
          <h2 class="card-title text-2xl font-black text-primary">
            📡 httpResource API (Asynchronous Reactivity)
          </h2>
          <p class="text-base-content/70">
            Angular v22 stabilizes the <code>resource</code> and <code>httpResource</code> APIs.
            These APIs allow declarative asynchronous data fetching bound directly to reactive
            Signals. When any dependent parameter signal changes, the HTTP request refetches
            automatically.
          </p>
          <div class="flex items-center gap-4 mt-2">
            <span class="font-bold">Select TODO ID:</span>
            <div class="join">
              <button
                (click)="decrementId()"
                [disabled]="todoId() <= 1"
                class="btn btn-sm btn-outline join-item"
              >
                -
              </button>
              <button class="btn btn-sm btn-active join-item">ID: {{ todoId() }}</button>
              <button (click)="incrementId()" class="btn btn-sm btn-outline join-item">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <!-- Before Card: RxJS switchMap -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <span class="badge badge-error gap-2 self-start font-semibold"
              >Before (RxJS + HttpClient)</span
            >
            <h3 class="text-xl font-bold mt-2">RxJS Pipeline with switchMap</h3>
            <p class="text-sm text-base-content/60">
              Fetching data reactively requires combining RxJS subjects, mapping streams with
              <code>switchMap</code>, and using the <code>async</code> pipe or manual subscription
              management.
            </p>

            <div class="bg-neutral text-neutral-content p-4 rounded-xl text-xs font-mono my-4">
              <pre>
todo$ = this.todoId$.pipe(
  switchMap(id => this.http.get&lt;Todo&gt;(\`.../todos/\${{ '{' }}id{{ '}' }}\`))
);</pre
              >
            </div>

            <div class="flex flex-col gap-4 mt-auto">
              <div
                class="bg-base-200 p-4 rounded-xl border border-base-300 min-h-[120px] flex flex-col justify-center"
              >
                @if (rxjsLoading()) {
                  <div class="flex items-center gap-2 text-base-content/50">
                    <span class="loading loading-spinner loading-sm"></span> Loading Resource...
                  </div>
                } @else if (rxjsError()) {
                  <div class="text-error font-semibold">Error loading resource.</div>
                } @else if (rxjsTodo(); as todo) {
                  <div>
                    <div class="text-xs uppercase text-base-content/50 font-bold">
                      Todo Details (RxJS)
                    </div>
                    <div class="font-bold text-lg mt-1">{{ todo.title }}</div>
                    <div class="mt-2">
                      <span
                        class="badge"
                        [class.badge-success]="todo.completed"
                        [class.badge-warning]="!todo.completed"
                      >
                        {{ todo.completed ? 'Completed' : 'Pending' }}
                      </span>
                    </div>
                  </div>
                } @else {
                  <div class="flex items-center gap-2 text-base-content/50">
                    <span class="loading loading-spinner loading-sm"></span> Fetching RxJS...
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- After Card: httpResource -->
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body">
            <span class="badge badge-success gap-2 self-start font-semibold"
              >After (httpResource)</span
            >
            <h3 class="text-xl font-bold mt-2">Declarative Asynchronous Signal</h3>
            <p class="text-sm text-base-content/60">
              The <code>httpResource</code> API creates a read-only signal wrapping the request. It
              tracks dependency signals automatically, showing status, loading states, and value.
            </p>

            <div class="bg-neutral text-neutral-content p-4 rounded-xl text-xs font-mono my-4">
              <pre>
todo = httpResource&lt;Todo&gt;(() =>
  \`.../todos/\${{ '{' }}this.todoId(){{ '}' }}\`
);</pre
              >
            </div>

            <div class="flex flex-col gap-4 mt-auto">
              <div
                class="bg-base-200 p-4 rounded-xl border border-base-300 min-h-[120px] flex flex-col justify-center"
              >
                @if (todoResource.isLoading()) {
                  <div class="flex items-center gap-2 text-base-content/50">
                    <span class="loading loading-spinner loading-sm"></span> Loading Resource...
                  </div>
                } @else if (todoResource.error()) {
                  <div class="text-error font-semibold">Error loading resource.</div>
                } @else if (todoResource.value(); as todo) {
                  <div>
                    <div class="text-xs uppercase text-base-content/50 font-bold">
                      Todo Details (httpResource)
                    </div>
                    <div class="font-bold text-lg mt-1">{{ todo.title }}</div>
                    <div class="mt-2">
                      <span
                        class="badge"
                        [class.badge-success]="todo.completed"
                        [class.badge-warning]="!todo.completed"
                      >
                        {{ todo.completed ? 'Completed' : 'Pending' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HttpResourceComponent {
  todoId = signal<number>(1);

  private http = inject(HttpClient);
  private id$ = toObservable(this.todoId);

  rxjsTodo = toSignal<Todo>(
    this.id$.pipe(
      switchMap((id) => {
        this.rxjsLoading.set(true);
        this.rxjsError.set(null);
        return this.http.get<Todo>(`https://jsonplaceholder.typicode.com/todos/${id}`).pipe(
          tap(() => {
            this.rxjsLoading.set(false);
          }),
          catchError((e) => {
            this.rxjsError.set(e);
            this.rxjsLoading.set(false);
            throw e;
          }),
        );
      }),
    ),
  );
  rxjsLoading = signal(false);
  rxjsError = signal<Error | null>(null);

  todoResource = httpResource<Todo>(() => {
    return `https://jsonplaceholder.typicode.com/todos/${this.todoId()}`;
  });

  incrementId() {
    this.todoId.update((id) => id + 1);
  }

  decrementId() {
    this.todoId.update((id) => Math.max(1, id - 1));
  }
}
