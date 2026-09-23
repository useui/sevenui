import { DEFAULT_PACKAGE_MANAGER, PACKAGE_MANAGER_KEY, PACKAGE_MANAGERS } from "../lib/package-manager";

const script = `(function(){try{var v=localStorage.getItem(${JSON.stringify(PACKAGE_MANAGER_KEY)});var ok=${JSON.stringify(PACKAGE_MANAGERS)};document.documentElement.dataset.pm=ok.indexOf(v)>-1?v:${JSON.stringify(DEFAULT_PACKAGE_MANAGER)};}catch(e){document.documentElement.dataset.pm=${JSON.stringify(DEFAULT_PACKAGE_MANAGER)};}})();`;

export function PackageManagerScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: a constant pre-paint script built from our own constants
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
