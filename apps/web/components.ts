import { defineComponents } from "blume";
import Header from "./components/blume/Header.astro";
import InstallCommand from "./components/install-command.astro";

export default defineComponents({
  layout: { Header },
  mdx: { InstallCommand },
});
