import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import {
  createEffect,
  debounceTime,
  distinctUntilChanged,
  from,
  fromHttp,
  map,
  signal,
} from "node-signals";
import { render } from "node-signals/dom";
import type { Fragment } from "node-signals/dom";
import {
  defaultPlaygroundCode,
  searchPlaygroundCode,
} from "./playground-samples";

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

let editor: monaco.editor.IStandaloneCodeEditor | undefined;
let disposeRender: (() => void) | undefined;

function trackedRender(
  container: string | Element,
  view: (frag: Fragment) => Node,
): () => void {
  disposeRender?.();
  disposeRender = render(container, view);
  return disposeRender;
}

const api = {
  signal,
  createEffect,
  render: trackedRender,
  from,
  fromHttp,
  map,
  debounceTime,
  distinctUntilChanged,
};

function setPreviewMessage(message: string, isError = false): void {
  const preview = document.querySelector<HTMLElement>("#render-app")!;

  preview.replaceChildren();
  const note = document.createElement("p");
  note.className = isError ? "preview-error" : "preview-note";
  note.textContent = message;
  preview.append(note);
}

function runPlayground(code: string): void {
  disposeRender?.();
  disposeRender = undefined;

  try {
    const runner = new Function(
      ...Object.keys(api),
      `"use strict";\n${code}`,
    ) as (...args: unknown[]) => void;

    runner(...Object.values(api));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setPreviewMessage(message, true);
  }
}

export function initPlayground(): void {
  const container = document.querySelector<HTMLElement>("#editor-container")!;
  const runBtn = document.querySelector<HTMLButtonElement>("#run-playground")!;
  const sampleCounter = document.querySelector<HTMLButtonElement>(
    "#sample-counter",
  )!;
  const sampleSearch = document.querySelector<HTMLButtonElement>(
    "#sample-search",
  )!;

  editor = monaco.editor.create(container, {
    value: defaultPlaygroundCode,
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
  });

  runBtn.addEventListener("click", () => {
    runPlayground(editor?.getValue() ?? "");
  });

  sampleCounter.addEventListener("click", () => {
    editor?.setValue(defaultPlaygroundCode);
    runPlayground(defaultPlaygroundCode);
  });

  sampleSearch.addEventListener("click", () => {
    editor?.setValue(searchPlaygroundCode);
    runPlayground(searchPlaygroundCode);
  });

  runPlayground(defaultPlaygroundCode);
}
