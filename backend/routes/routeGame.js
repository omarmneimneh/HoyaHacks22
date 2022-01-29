import express, { Router } from "express";
const routeGame = express.Router();
import { gameManager } from "../component/game.js"; 


routeGame.get("/lock_in_answer", (req, res) => {
  /*
  Schema for /lock_in_answer
  {
    gameId: String, // Unique ID for the game
  }
  */
  gameManager.findGame(req.body.gameId).lockIn();
});

export { routeGame }