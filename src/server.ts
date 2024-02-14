import appConfig from "./config/app.config";
import App from "./app/app";

const port = 3001;
const app = new App(appConfig);
app.start(port);
