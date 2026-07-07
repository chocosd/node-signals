export function initTabs(options: {
  onDemos: () => void;
  onPlayground: () => void;
}): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>("[data-tab]");
  const panels = document.querySelectorAll<HTMLElement>("[data-tab-panel]");

  let demosReady = false;
  let playgroundReady = false;

  function activate(tabId: string): void {
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabId);
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== tabId;
    });

    if (tabId === "demos" && !demosReady) {
      demosReady = true;
      options.onDemos();
    }

    if (tabId === "playground" && !playgroundReady) {
      playgroundReady = true;
      options.onPlayground();
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.tab) {
        activate(tab.dataset.tab);
      }
    });
  });

  activate("demos");
}
