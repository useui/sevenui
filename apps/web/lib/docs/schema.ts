import { z } from "zod";

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});
