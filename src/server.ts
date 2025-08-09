import { buildApp } from "./app";

const app = buildApp();
const port = Number(process.env.PORT ?? 3000);
const host = "0.0.0.0";

app
  .listen({ port, host })
  .then(() => {
    app.log.info(`Server run on http://${host}:${port}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
