import { serve } from "inngest/next";
import { inngestClient } from "@/lib/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [],
});
