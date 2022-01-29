
import JSON5 from 'json5'
import fs from 'fs'


class GameManager {
  constructor(name) {
    this.players = []
    this.games = [] // Array of ongoing games
    this.idCounterGame = 123456 // Used to generate unique game id
    this.idCounterPlayer = 1 // Used to generate unique player id
    let questionsFile = fs.readFileSync('./storage/questions.jsonc')
    this.allQuestions = JSON5.parse(questionsFile)
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

  // Find a game by id
  findGame(id) {
    return this.games.find(game => game.id === id)
  }

  // Find a game by name
  findGamesByName(name) {
    return this.games.filter(game => game.name === name)
  }

  // Find a player by id
  findPlayer(id) {
    return this.players.find(player => player.id === id)
  }

  // Find a player by key
  findPlayerByKey(playerKey) {
    return this.players.find(player => player.playerKey === playerKey)
  }

  getGameList() {
    return this.games.map(game => game.toString())
  }
}

class GameSession {
  constructor(name) {
    this.name = name;
    this.id = gameManager.idCounterGame++;
    this.inviteCode = this.id.toString(36).toUpperCase() // Generate unique invite code based on game id
    this.players = [];
    this.created = new Date();
    
    this.questionIndex = 0;
    this.questionOrder = [];

    this.currentQuestion = {};
    

  }

  addPlayer(player) {
    player.gameId = this.id
    this.players.push(player);
  }

  removePlayer(player) {
    player.gameId = null
    this.players.splice(this.players.indexOf(player), 1);
  }

  getPlayer(id) {
    return this.players.find(player => player.id === id);
  }

  getPlayers() {
    return this.players;
  }

  toString() {
    return {
      id: this.id,
      authKey: this.authKey,
      name: this.name,
      inviteCode: this.inviteCode,
      playersLength: this.players.length,
    }
  }
}

class Player {
  constructor(name, ip) {
    this.name = name || ("Guest-" + gameManager.idCounterPlayer)
    this.ip = ip || null
    this.id = gameManager.idCounterPlayer++;
    this.gameId = null;
    this.playerKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
  }

  toString() {
    return {
      id: this.id,
      name: this.name,
      playerKey: this.playerKey,
    }
  }
}

let gameManager = new GameManager()
export { gameManager }