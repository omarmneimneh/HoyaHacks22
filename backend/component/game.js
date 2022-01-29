
import { jsonc } from 'jsonc'
import fs from 'fs'

class GameManager {
  constructor(name) {
    this.players = []
    this.games = [] // Array of ongoing games
    this.idCounterGame = 123456 // Used to generate unique game id
    this.idCounterPlayer = 1 // Used to generate unique player id
    let questionsFile = fs.readFileSync('../storage/questions.jsonc')
    this.allQuestions = jsonc.parse(questionsFile)
  }

  // Register an anonymous player
  connectPlayer(name, ip) {
    let player = new Player(name, ip)
    this.players.push(player)
    return player
  }


  // Create a new game
  createGame(name) {
    let game = new GameSession(name)
    this.games.push(game)
    return game
  }

  joinGame(gameId, player) {
    let game = this.getGame(gameId)
    if (game) {
      game.addPlayer(player)
      return game
    }
    return null
  }

  // Find a game by id
  findGame(id) {
    return this.games.find(game => game.id === id)
  }

  // Find a game by name
  findGameByName(name) {
    return this.games.find(game => game.name === name)
  }

  // Add player to a game
  addPlayer(gameId, player) {
    let game = this.findGame(gameId)
    if (game) {
      game.addPlayer(player)
    }
  }

  // Remove player from a game
  removePlayer(gameId, playerId) {
    let game = this.findGame(gameId)
    if (game) {
      game.removePlayer(playerId)
    }
  }
}

class GameSession {
  constructor(name) {
    this.name = name;
    this.player = player;
    this.id = idCounterGame++;
    this.inviteCode = this.id.toString(36).toUpperCase() // Generate unique invite code based on game id
    this.players = [];
    this.players.push(player);
    this.maxPlayers = game.maxPlayers;
    this.created = new Date();
    
    this.questionIndex = 0;
    this.questionOrder = [];
    this.lifelines = {
      "50/50": {
        "used": false,
      },
      "Ask the Audience": {
        "used": false,
      },
      "Phone a Friend": {
        "used": false,
      }
    };
    this.currentQuestion = {};
    

  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players.splice(this.players.indexOf(player), 1);
  }

  getPlayer(id) {
    return this.players.find(player => player.id === id);
  }

  getPlayers() {
    return this.players;
  }

  getPlayerCount() {
    return this.players.length;
  }
}

class Player {
  constructor(name, ip) {
    this.name = name || ("Guest-" + idCounterPlayer)
    this.ip = ip || null
    this.id = idCounterPlayer++;
    this.gameId = null;
  }

  toString() {
    return {
      "id": this.id,
      "name": this.name,

    }
  }
}

let gameManager = new GameManager()
export { gameManager }