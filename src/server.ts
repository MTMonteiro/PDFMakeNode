import express from "express";
import {routes} from './router';

const app = express();

app.use(routes);

app.listem(3000, () => console.log("serve is running on port 3000"))
