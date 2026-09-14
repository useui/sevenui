import { defineComponents } from "blume";
import Header from "./components/blume/Header.astro";
import Sidebar from "./components/blume/NavTree.astro";
import InstallCommand from "./components/install-command.astro";

// `Sidebar` alone covers both breakpoints: RootLayout only splits the mobile
// drawer off into a separate component when `MobileNav` is ALSO overridden
// (`const MobileNavSlot = layout.MobileNav ? … : null`), and it is not.
export default defineComponents({
  layout: { Header, Sidebar },
  mdx: { InstallCommand },
});
