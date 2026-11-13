import { DEFAULT_FLAVOUR, FLAVOUR_ATTR, FLAVOUR_KEY, FLAVOUR_PARAM, FLAVOURS } from "../lib/flavour";

// Runs before first paint, like PackageManagerScript: a `?flavour=` parameter (a shared link) wins and is
// remembered, otherwise the stored choice applies. Reading the URL here, not on the server, keeps every
// page static.
const script = `(function(){var ok=${JSON.stringify(FLAVOURS)},d=${JSON.stringify(DEFAULT_FLAVOUR)},v=null;try{var q=new URLSearchParams(location.search).get(${JSON.stringify(FLAVOUR_PARAM)});if(ok.indexOf(q)>-1){v=q;localStorage.setItem(${JSON.stringify(FLAVOUR_KEY)},q);}else{v=localStorage.getItem(${JSON.stringify(FLAVOUR_KEY)});}}catch(e){}document.documentElement.setAttribute(${JSON.stringify(FLAVOUR_ATTR)},ok.indexOf(v)>-1?v:d);})();`;

export function FlavourScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: a constant pre-paint script built from our own constants
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
