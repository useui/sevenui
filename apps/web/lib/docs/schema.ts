import { z } from "zod";

// Missing or malformed frontmatter FAILS THE BUILD, as Blume's content
// collection schema does today. `description` feeds both <meta> and the OG
// card, so a silent empty string is a production regression, not a warning.
export const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});
