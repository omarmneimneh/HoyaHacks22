import express from "express";
const routeConnect = express.Router();
import { gameManager } from "../component/game.js"; 

// Log in and such
routeConnect.route("/connect", (req, res) => {
  /*
  Schema for /connect
  {
    name: String, // Name of the player
    deviceId: String, // Stored in client's localStorage, set as Math.random()
  }
  RETURNS
  {
    name: String, // Name of the player
    id: String, // Unique ID for the player
  }
  */
  let name = req.body.name;
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let deviceId = req.body.deviceId;
  const player = gameManager.connectPlayer(name, ip, deviceId);
  res.send(player.toString());
});

// Implement invite codes, join game, etc.
routeConnect.post("/new_game", (req, res) => {
  /*
  Schema for /new_game
  {
    hostId: String, // ID of the player
  }
  RETURNS
  {
    id: String, // Unique player ID for the game
    name: String, // Name of the game
    inviteCode: String, // Invite code for the game'
    players: [] // Array of players (empty for now)
  }
  */

  let game = gameManager.createGame(req.body.name);
  res.send(game.toString());
});

routeConnect.get("/games", (req, res) => {
  /*
  Schema for /games
  RETURNS
  {
    games: Array<Game>
  }
  */
  res.send(gameManager.getGameList());
});

routeConnect.post("/join_game", (req, res) => {
  /*
  Schema for /join_game
  {
    gameId: String, // ID of the game
    playerId: String, // ID of the player
  }
  RETURNS
  {
    gameId: String, // ID of the game
    name: String, // Name of the game
    inviteCode: String, // Invite code for the game
    players: Array<Player> // List of players in the game
  */
  let collection = gameManager.joinGame(req.body.gameId, req.body.playerId);
  return res.send(collection.game.toString());
});

routeConnect.post("/leave_game", (req, res) => {
  /*
  Schema for /leave_game
  {
    gameId: String, // ID of the game
    playerId: String, // ID of the player
  }
  RETURNS
  {
    error: undefined | Boolean, // Whether the player was successfully removed
  }
  */
  gameManager.removePlayer(req.body.gameId, req.body.playerId);
  res.send({error: false});
})


export { routeConnect } 