import { buildApp } from "./app";
import "tsconfig-paths/register";
import { env } from "@/config/env";

const port = env.PORT;
const host = "0.0.0.0";

buildApp()
  .listen({ port, host })
  .then(() => {
    console.log(`Server run on http://${host}:${port}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
