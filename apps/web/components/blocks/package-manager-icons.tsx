/**
 * Brand marks for the package-manager switcher, as ONE sprite rendered once per
 * page (by the /blocks layout — Task 5.2) and referenced with
 * `<use href="#pm-icon-*">` from every install control
 * (`components/blocks/install-control.tsx`).
 *
 * A sprite rather than inlined copies for two reasons. Size: bun's mark alone is
 * 3.2KB, and a category page renders it twice per card (menu option + trigger),
 * so six cards would ship ~40KB of duplicated path data. Correctness: the pnpm
 * mark ships as `<defs>` + `<use href="#id">`, and repeating those ids per card
 * would put a dozen colliding ids in one document.
 *
 * Artwork from TheSVG's `thesvg-color` set (https://github.com/glincker/thesvg),
 * vendored rather than installed: four icons do not justify a dependency, and
 * nothing here should need a network request at runtime. Each mark is the
 * respective project's own trademark, used only to identify that project.
 *
 * pnpm's neutral squares are `currentColor`, not the set's baked #4e4e4e /
 * #fff. The upstream set solves light-vs-dark by shipping `pnpm-light` and
 * `pnpm-dark` as separate icons; currentColor collapses that into one mark that
 * tracks whatever text colour the control is painted in, so it stays legible in
 * both themes and in every base colour the theme dock offers.
 *
 * A Server Component: pure markup, no state, no handlers. Ported from
 * `legacy-components/package-manager-icons.astro`; the artwork below is
 * byte-for-byte that file's, with only `fill-rule` respelled for JSX.
 */
export function PackageManagerIcons() {
  return (
    // Deliberately NOT `display: none`: an absolutely positioned zero-box
    // sprite is the shape with no history of `<use>` resolution quirks.
    <svg
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <symbol id="pm-icon-npm" viewBox="0 0 2500 2500"><path fill="#c00" d="M0 0h2500v2500H0z"/><path fill="#fff" d="M1241.5 268.5h-973v1962.9h972.9V763.5h495v1467.9h495V268.5z"/></symbol>
      <symbol id="pm-icon-pnpm" viewBox="76.59 44 164.008 164"><path fill="#f9ad00" d="M237.6 95h-50V45h50z"/><path fill="#f9ad00" d="M182.59 95h-50V45h50z"/><path fill="#f9ad00" d="M127.59 95h-50V45h50z"/><path fill="#f9ad00" d="M237.6 150h-50v-50h50z"/><path fill="currentColor" d="M182.59 150h-50v-50h50z"/><path fill="currentColor" d="M182.59 205h-50v-50h50z"/><path fill="currentColor" d="M237.6 205h-50v-50h50z"/><path fill="currentColor" d="M127.59 205h-50v-50h50z"/></symbol>
      <symbol id="pm-icon-yarn" viewBox="0 0 518 518"><path fill="#2c8ebb" d="M259 0c143 0 259 116 259 259S402 518 259 518S0 402 0 259S116 0 259 0"/><path fill="#fff" d="M435.2 337.5c-1.8-14.2-13.8-24-29.2-23.8c-23 .3-42.3 12.2-55.1 20.1c-5 3.1-9.3 5.4-13 7.1c.8-11.6.1-26.8-5.9-43.5c-7.3-20-17.1-32.3-24.1-39.4c8.1-11.8 19.2-29 24.4-55.6c4.5-22.7 3.1-58-7.2-77.8c-2.1-4-5.6-6.9-10-8.1c-1.8-.5-5.2-1.5-11.9.4C293.1 96 289.6 93.8 286.9 92c-5.6-3.6-12.2-4.4-18.4-2.1c-8.3 3-15.4 11-22.1 25.2c-1 2.1-1.9 4.1-2.7 6.1c-12.7.9-32.7 5.5-49.6 23.8c-2.1 2.3-6.2 4-10.5 5.6h.1c-8.8 3.1-12.8 10.3-17.7 23.3c-6.8 18.2.2 36.1 7.1 47.7c-9.4 8.4-21.9 21.8-28.5 37.5c-8.2 19.4-9.1 38.4-8.8 48.7c-7 7.4-17.8 21.3-19 36.9c-1.6 21.8 6.3 36.6 9.8 42c1 1.6 2.1 2.9 3.3 4.2c-.4 2.7-.5 5.6.1 8.6c1.3 7 5.7 12.7 12.4 16.3c13.2 7 31.6 10 45.8 2.9c5.1 5.4 14.4 10.6 31.3 10.6h1c4.3 0 58.9-2.9 74.8-6.8c7.1-1.7 12-4.7 15.2-7.4c10.2-3.2 38.4-12.8 65-30c18.8-12.2 25.3-14.8 39.3-18.2c13.6-3.3 22.1-15.7 20.4-29.4m-23.8 14.7c-16 3.8-24.1 7.3-43.9 20.2c-30.9 20-64.7 29.3-64.7 29.3s-2.8 4.2-10.9 6.1c-14 3.4-66.7 6.3-71.5 6.4c-12.9.1-20.8-3.3-23-8.6c-6.7-16 9.6-23 9.6-23s-3.6-2.2-5.7-4.2c-1.9-1.9-3.9-5.7-4.5-4.3c-2.5 6.1-3.8 21-10.5 27.7c-9.2 9.3-26.6 6.2-36.9.8c-11.3-6 .8-20.1.8-20.1s-6.1 3.6-11-3.8c-4.4-6.8-8.5-18.4-7.4-32.7c1.2-16.3 19.4-32.1 19.4-32.1s-3.2-24.1 7.3-48.8c9.5-22.5 35.1-40.6 35.1-40.6s-21.5-23.8-13.5-45.2c5.2-14 7.3-13.9 9-14.5c6-2.3 11.8-4.8 16.1-9.5c21.5-23.2 48.9-18.8 48.9-18.8s13-39.5 25-31.8c3.7 2.4 17 32 17 32s14.2-8.3 15.8-5.2c8.6 16.7 9.6 48.6 5.8 68c-6.4 32-22.4 49.2-28.8 60c-1.5 2.5 17.2 10.4 29 43.1c10.9 29.9 1.2 55 2.9 57.8c.3.5.4.7.4.7s12.5 1 37.6-14.5c13.4-8.3 29.3-17.6 47.4-17.8c17.5-.3 18.4 20.2 5.2 23.4"/></symbol>
      <symbol id="pm-icon-bun" viewBox="0 0 80 70"><path d="M71.09 20.74c-.16-.17-.33-.34-.5-.5s-.33-.34-.5-.5s-.33-.34-.5-.5s-.33-.34-.5-.5s-.33-.34-.5-.5s-.33-.34-.5-.5s-.33-.34-.5-.5A26.46 26.46 0 0 1 75.5 35.7c0 16.57-16.82 30.05-37.5 30.05c-11.58 0-21.94-4.23-28.83-10.86l.5.5l.5.5l.5.5l.5.5l.5.5l.5.5l.5.5C19.55 65.3 30.14 69.75 42 69.75c20.68 0 37.5-13.48 37.5-30c0-7.06-3.04-13.75-8.41-19.01"/><path fill="#fbf0df" d="M73 35.7c0 15.21-15.67 27.54-35 27.54S3 50.91 3 35.7C3 26.27 9 17.94 18.22 13S33.18 3 38 3s8.94 4.13 19.78 10C67 17.94 73 26.27 73 35.7"/><path fill="#f6dece" d="M73 35.7a21.7 21.7 0 0 0-.8-5.78c-2.73 33.3-43.35 34.9-59.32 24.94A40 40 0 0 0 38 63.24c19.3 0 35-12.35 35-27.54"/><path fill="#fffefc" d="M24.53 11.17C29 8.49 34.94 3.46 40.78 3.45A9.3 9.3 0 0 0 38 3c-2.42 0-5 1.25-8.25 3.13c-1.13.66-2.3 1.39-3.54 2.15c-2.33 1.44-5 3.07-8 4.7C8.69 18.13 3 26.62 3 35.7v1.19c6.06-21.41 17.07-23.04 21.53-25.72"/><path fill="#ccbea7" fillRule="evenodd" d="M35.12 5.53A16.41 16.41 0 0 1 29.49 18c-.28.25-.06.73.3.59c3.37-1.31 7.92-5.23 6-13.14c-.08-.45-.67-.33-.67.08m2.27 0A16.24 16.24 0 0 1 39 19c-.12.35.31.65.55.36c2.19-2.8 4.1-8.36-1.62-14.36c-.29-.26-.74.14-.54.49Zm2.76-.17A16.42 16.42 0 0 1 47 17.12a.33.33 0 0 0 .65.11c.92-3.49.4-9.44-7.17-12.53c-.4-.16-.66.38-.33.62Zm-18.46 10.4a16.94 16.94 0 0 0 10.47-9c.18-.36.75-.22.66.18c-1.73 8-7.52 9.67-11.12 9.45c-.38.01-.37-.52-.01-.63"/><path d="M38 65.75C17.32 65.75.5 52.27.5 35.7c0-10 6.18-19.33 16.53-24.92c3-1.6 5.57-3.21 7.86-4.62c1.26-.78 2.45-1.51 3.6-2.19C32 1.89 35 .5 38 .5s5.62 1.2 8.9 3.14c1 .57 2 1.19 3.07 1.87c2.49 1.54 5.3 3.28 9 5.27C69.32 16.37 75.5 25.69 75.5 35.7c0 16.57-16.82 30.05-37.5 30.05M38 3c-2.42 0-5 1.25-8.25 3.13c-1.13.66-2.3 1.39-3.54 2.15c-2.33 1.44-5 3.07-8 4.7C8.69 18.13 3 26.62 3 35.7c0 15.19 15.7 27.55 35 27.55S73 50.89 73 35.7c0-9.08-5.69-17.57-15.22-22.7c-3.78-2-6.73-3.88-9.12-5.36c-1.09-.67-2.09-1.29-3-1.84C42.63 4 40.42 3 38 3"/><path fill="#b71422" d="M45.05 43a8.93 8.93 0 0 1-2.92 4.71a6.8 6.8 0 0 1-4 1.88A6.84 6.84 0 0 1 34 47.71A8.93 8.93 0 0 1 31.12 43a.72.72 0 0 1 .8-.81h12.34a.72.72 0 0 1 .79.81"/><path fill="#ff6164" d="M34 47.79a6.9 6.9 0 0 0 4.12 1.9a6.9 6.9 0 0 0 4.11-1.9a11 11 0 0 0 1-1.07a6.83 6.83 0 0 0-4.9-2.31a6.15 6.15 0 0 0-5 2.78c.23.21.43.41.67.6"/><path d="M34.16 47a5.36 5.36 0 0 1 4.19-2.08a6 6 0 0 1 4 1.69c.23-.25.45-.51.66-.77a7 7 0 0 0-4.71-1.93a6.36 6.36 0 0 0-4.89 2.36a10 10 0 0 0 .75.73"/><path d="M38.09 50.19a7.42 7.42 0 0 1-4.45-2a9.52 9.52 0 0 1-3.11-5.05a1.2 1.2 0 0 1 .26-1a1.41 1.41 0 0 1 1.13-.51h12.34a1.44 1.44 0 0 1 1.13.51a1.19 1.19 0 0 1 .25 1a9.52 9.52 0 0 1-3.11 5.05a7.42 7.42 0 0 1-4.44 2m-6.17-7.4c-.16 0-.2.07-.21.09a8.3 8.3 0 0 0 2.73 4.37A6.23 6.23 0 0 0 38.09 49a6.28 6.28 0 0 0 3.65-1.73a8.3 8.3 0 0 0 2.72-4.37a.21.21 0 0 0-.2-.09Z"/><ellipse cx="53.22" cy="40.18" fill="#febbd0" rx="5.85" ry="3.44"/><ellipse cx="22.95" cy="40.18" fill="#febbd0" rx="5.85" ry="3.44"/><path fillRule="evenodd" d="M25.7 38.8a5.51 5.51 0 1 0-5.5-5.51a5.51 5.51 0 0 0 5.5 5.51m24.77 0A5.51 5.51 0 1 0 45 33.29a5.5 5.5 0 0 0 5.47 5.51"/><path fill="#fff" fillRule="evenodd" d="M24 33.64a2.07 2.07 0 1 0-2.06-2.07A2.07 2.07 0 0 0 24 33.64m24.77 0a2.07 2.07 0 1 0-2.06-2.07a2.07 2.07 0 0 0 2.04 2.07Z"/></symbol>
    </svg>
  );
}
