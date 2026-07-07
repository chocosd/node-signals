import { initDemos } from "./demos";
import { initPlayground } from "./playground";
import { initTabs } from "./tabs";

initTabs({
  onDemos: initDemos,
  onPlayground: initPlayground,
});
