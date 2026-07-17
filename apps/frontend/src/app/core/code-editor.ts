import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeService, type ExecuteResult } from '../services/code.service';

// Editable "try it yourself" editor: a lightweight textarea plus a Run button that executes
// the code via the backend and shows stdout/stderr. Kept deliberately simple (no Monaco) so
// it stays dependency-free; a richer editor can replace the textarea later without changing
// the surrounding contract.
@Component({
  selector: 'app-code-editor',
  imports: [FormsModule],
  template: `
    <div class="overflow-hidden rounded-xl border-2 border-black bg-gray-900 shadow-md">
      <div class="flex items-center justify-between border-b-2 border-black bg-gray-800 px-4 py-2">
        <span class="text-xs font-black uppercase tracking-wide text-yellow-400">{{ language() }}</span>
        <button
          type="button"
          class="rounded-lg border-2 border-black bg-green-600 px-3 py-1 text-xs font-black text-white transition-all hover:scale-105 disabled:opacity-60"
          [disabled]="running()"
          (click)="run()"
        >
          {{ running() ? 'Running...' : 'Run' }}
        </button>
      </div>
      <textarea
        class="block w-full resize-y bg-gray-900 px-4 py-3 font-mono text-sm leading-relaxed text-gray-100 outline-none"
        rows="8"
        spellcheck="false"
        [ngModel]="source()"
        (ngModelChange)="source.set($event)"
      ></textarea>
    </div>

    @if (error()) {
      <p class="mt-2 rounded-lg border-2 border-black bg-red-100 px-3 py-2 text-sm font-bold text-red-700">
        {{ error() }}
      </p>
    }

    @if (result(); as r) {
      <div class="mt-2 overflow-hidden rounded-xl border-2 border-black bg-white shadow-md">
        <p class="border-b-2 border-black bg-gray-800 px-4 py-2 text-xs font-black uppercase text-yellow-400">
          Output
          @if (r.timedOut) {
            <span class="ml-2 text-red-400">timed out</span>
          } @else if (r.exitCode !== 0 && r.exitCode !== null) {
            <span class="ml-2 text-red-400">exit {{ r.exitCode }}</span>
          }
        </p>
        <pre
          class="overflow-x-auto px-4 py-3 font-mono text-sm"
          [class.text-gray-800]="!r.stderr"
          [class.text-red-700]="!!r.stderr && !r.stdout"
        >{{ displayOutput(r) }}</pre>
      </div>
    }
  `,
})
export class CodeEditor {
  readonly code = input.required<string>();
  readonly language = input.required<string>();

  private readonly codeService = inject(CodeService);

  readonly source = signal('');
  readonly running = signal(false);
  readonly result = signal<ExecuteResult | null>(null);
  readonly error = signal<string | undefined>(undefined);

  constructor() {
    // Seed (and re-seed) the editable buffer whenever the incoming example changes.
    effect(() => {
      this.source.set(this.code());
      this.result.set(null);
      this.error.set(undefined);
    });
  }

  displayOutput(r: ExecuteResult): string {
    if (r.timedOut && !r.stdout && !r.stderr) return '(no output — execution timed out)';
    const combined = [r.stdout, r.stderr].filter(Boolean).join('\n');
    return combined || '(no output)';
  }

  async run(): Promise<void> {
    this.running.set(true);
    this.error.set(undefined);
    try {
      this.result.set(await this.codeService.execute(this.language(), this.source()));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to run code.');
    } finally {
      this.running.set(false);
    }
  }
}
