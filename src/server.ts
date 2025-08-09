import { buildApp } from "./app";

const port = Number(process.env.PORT) || 3000;
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
