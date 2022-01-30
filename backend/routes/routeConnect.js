import express from "express";
const routeConnect = express.Router();
import { gameManager } from "../component/game.js"; 
const gm = gameManager;

// Log in and such
routeConnect.post("/guest_login", (req, res) => {
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
  const player = gm.connectPlayer(name, ip, deviceId);
  res.send(player.toString());
});

// Implement invite codes, join game, etc.
routeConnect.post("/new_game", (req, res) => {
  /*
  Schema for /new_game
  {
    name: String, // Name of the game
    playerKey: String, // Auth key of the player creating the game
  }
  RETURNS
  {
    id: String, // Unique player ID for the game
    name: String, // Name of the game
    inviteCode: String, // Invite code for the game'
    players: [] // Array of players (empty for now)
  }
  */

  let game = gm.createGame(req.body.name);
  let player = gm.findPlayerByKey(req.body.playerKey);
  game.hostId = player.id;
  game.addPlayer(player);
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
 //res.send({"Hello world": true})
 res.send(gm.getGameList());
});

routeConnect.post("/join_game", (req, res) => {
  /*
  Schema for /join_game
  {
    inviteCode: String, // ID of the game to join
    playerKey: String, // Auth key of the player
  }
  RETURNS
  {
    gameId: String, // ID of the game
    name: String, // Name of the game
    inviteCode: String, // Invite code for the game
    players: Array<Player> // List of players in the game
  */
  let inviteCode = req.body.inviteCode;
  let game = gm.games.find(game => game.inviteCode === inviteCode);
  let player = gm.findPlayerByKey(req.body.playerKey);
  game.addPlayer(player);
  res.send(game.toString());
});

routeConnect.post("/leave_game", (req, res) => {
  /*
  Schema for /leave_game
  {
    playerKey: String, // Auth key of the player
  }
  RETURNS
  {
    error: undefined | Boolean, // Whether the player was successfully removed
  }
  */
  let player = gm.findPlayerByKey(req.body.playerKey);
  let game = gm.findGame(req.body.gameId);
  game.removePlayer(player);
  res.send({error: false});
})

routeConnect.post("/start_quiz", (req, res) => {
  /*
  Schema for /leave_game
  {
    playerKey: String, // Auth key of the player
  }
  RETURNS
  {
    error: undefined | Boolean, // Whether the player was successfully removed
  }
  */
  let player = gm.findPlayerByKey(req.body.playerKey);
  let game = gm.findGame(player.gameId);
  game.startQuiz();
  res.send({error: false});
})


export { routeConnect } 