import express from "express";
import { createApp } from "./backend/server.js";

export default createApp({ expressFactory: express });
