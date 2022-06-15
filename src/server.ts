/// <reference path="global.d.ts"/>
import type { NextFunction, Request, Response } from "express";
import express from "express";
import {parse} from "./parse";
import { Errors, makeController } from "./utils";
import {videoLinks} from "./video-links";

const app = express();
const port = process.env.PORT ?? 3000;

function setupErrorAndResponse(req: Request, res: Response, next: NextFunction) {
  res.error = (err) => res.status(err.statusCode).json(err);
  res.ok = (ok) => res.status(ok.statusCode).json(ok);
  next()
};
function onListen() {
  console.log(`kodik-video-links => server has been started at port ${port}`)
};

app.use(setupErrorAndResponse);

app.get("/parse", makeController((req,res) => parse(req.query.link as string, "extended" in req.query)));
app.get("/video-links", makeController((req,res) => videoLinks(req.query.link as string, "extended" in req.query)));

app.use((req,res) => res.error(Errors.notFound));

app.listen(port, onListen).on("request", (req,res) => {
  console.log(`kodik-video-links => onRequest:${req.socket.remoteAddress} url:${req.url}`);
});