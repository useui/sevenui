import { DEFAULT_PACKAGE_MANAGER, PACKAGE_MANAGER_KEY, PACKAGE_MANAGERS } from "../lib/package-manager";

// Pre-paint, deliberately uncompiled and unbundled: the whole point is that it
// runs before first paint. §13.2 promotes data-pm from a /blocks-local hook to
// a site-wide attribute beside data-theme, because §6.1 puts a package-manager
// bar on 67 docs pages.
const script = `(function(){try{var v=localStorage.getItem(${JSON.stringify(PACKAGE_MANAGER_KEY)});var ok=${JSON.stringify(PACKAGE_MANAGERS)};document.documentElement.dataset.pm=ok.indexOf(v)>-1?v:${JSON.stringify(DEFAULT_PACKAGE_MANAGER)};}catch(e){document.documentElement.dataset.pm=${JSON.stringify(DEFAULT_PACKAGE_MANAGER)};}})();`;

export function PackageManagerScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
