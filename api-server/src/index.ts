import app, { port } from "./app";
import Logger from "./config/logger";

app.listen(port, () => {
  Logger.info(`Example app listening at http://localhost:${port}`);
});
