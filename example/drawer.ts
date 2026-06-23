import { snippets, snippetTitles, type SnippetId } from "./snippets";

export function initCodeDrawer(): void {
  const drawer = document.querySelector<HTMLElement>("#code-drawer")!;
  const backdrop = document.querySelector<HTMLElement>("#drawer-backdrop")!;
  const title = document.querySelector<HTMLElement>("#drawer-title")!;
  const code = document.querySelector<HTMLElement>("#drawer-code")!;
  const closeBtn = document.querySelector<HTMLButtonElement>("#drawer-close")!;

  function open(id: SnippetId): void {
    title.textContent = snippetTitles[id];
    code.textContent = snippets[id];
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
  }

  function close(): void {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
  }

  document.querySelectorAll<HTMLButtonElement>("[data-code]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.code as SnippetId;
      open(id);
    });
  });

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer.classList.contains("open")) {
      close();
    }
  });
}
