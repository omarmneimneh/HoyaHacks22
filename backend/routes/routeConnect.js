import express from "express";
const router = express.Router();
import { gameManager } from "../component/game"; 

// Log in and such
router.route("/connect", (req, res) => {
  /*
  Schema
  {
    name: String, // Name of the player
    ip: String, // IP address of the client
    deviceId: String, // Stored in client's localStorage, set as Math.random()
  }
  */
  let name = req.body.name;
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let deviceId = req.body.deviceId;
  const player = gameManager.connectPlayer(name, ip, deviceId);
  res.send(player.toString());
});

// Implement invite codes, join game, etc.
router.post("/new_game", (req, res) => {
  gameManager.createGame(req.body.name);
});

router.post("/join_game", (req, res) => {
  gameManager.addPlayer(req.body.gameId, req.body.player);
});

router.post("/leave_game", (req, res) => {
  gameManager.removePlayer(req.body.gameId, req.body.playerId);
});