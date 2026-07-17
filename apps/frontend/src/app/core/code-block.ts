import { Component, computed, input } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';

hljs.registerLanguage('python', python);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);

const ALIASES: Record<string, string> = {
  py: 'python',
  'c++': 'cpp',
  js: 'javascript',
};

// Read-only highlighted code display. Code execution is deferred — no run button here.
@Component({
  selector: 'app-code-block',
  template: `
    <div class="overflow-hidden rounded-xl border-2 border-black bg-gray-900 shadow-md">
      <div class="flex items-center justify-between border-b-2 border-black bg-gray-800 px-4 py-2">
        <span class="text-xs font-black uppercase tracking-wide text-yellow-400">{{ languageLabel() }}</span>
      </div>
      <pre class="overflow-x-auto px-4 py-3 text-sm leading-relaxed text-gray-100"><code [innerHTML]="highlighted()"></code></pre>
    </div>
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();
  readonly language = input.required<string>();

  readonly languageLabel = computed(() => this.language().trim() || 'code');

  readonly highlighted = computed(() => {
    const raw = this.language().trim().toLowerCase();
    const lang = ALIASES[raw] ?? raw;
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(this.code(), { language: lang }).value;
    }
    // Unknown language: escaped plain text, no highlighting.
    return this.code()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  });
}
