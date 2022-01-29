import express from "express";
const router = express.Router();
import { GameSession } from "../component/game";

// Implement invite codes, join game, etc.
router.post("/new_game", (req, res) => {
  let game = new GameSession(req.body.name)
});