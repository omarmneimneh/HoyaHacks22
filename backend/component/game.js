
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
  createGame(name, hostId, participateAsHost) {
    let game = new GameSession(name, hostId, participateAsHost)
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

  
  getRandomQuestion () {
    return this.allQuestions[Math.floor(Math.random() * this.allQuestions.length)]
  }
}

class GameSession {
  constructor(name, hostId, participateAsHost) {
    this.name = name;
    this.id = gameManager.idCounterGame++;
    this.inviteCode = this.id.toString(36).toUpperCase() // Generate unique invite code based on game id
    this.players = [];
    this.created = new Date();
    this.hostId = hostId;
    this.participateAsHost = participateAsHost || true;
    this.timerReset = 30
    this.questionIndex = 0;
    this.questions = []
    
    // Generate a random order of questions
    let allQuestionsCopy = [ ...gameManager.allQuestions]
    while (allQuestionsCopy.length && this.questions.length < 15) {
      let index = Math.floor(Math.random() * allQuestionsCopy.length)
      this.questions.push(allQuestionsCopy[index])
      allQuestionsCopy.splice(index, 1)
    }
      

  }

  startQuiz() {
    this.questionIndex = 0;

  }

  incrementQuestion() {
    this.questionIndex++
    if (this.questionIndex >= this.questions.length) {

    }
  }



  getCurrentQuestion() {
    return this.questions[this.questionIndex]
  }

  getQuestion(index) {
    return this.questions[index]
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
    this.answerIndex = -1;
    this.onQuestionIndex = -1;
  }

  lockIn(answerIndex) {
    this.onQuestionIndex = gameManager.findGame(this.gameId).questionIndex
    this.answerIndex = answerIndex
  }

  getPercentages() {
    let audienceAnswers = []
    let myGame = gameManager.findGame(this.gameId)
    for (let player of myGame.players) {
      if (player.answerIndex > -1) {
        audienceAnswers.push(player.answerIndex)
      }
    }
    // Total up the answer counts
    let answerCounts = {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
    }
    for (let answer of audienceAnswers) {
      answerCounts[answer]++
    }
    // Convert answer counts to percentages
    let percentages = {}
    for (let answer in answerCounts) {
      percentages[answer] = Math.round(answerCounts[answer] / audienceAnswers.length * 100)
    }
    return percentages
  }

  useLifeline(lifeline) {
    console.log("using lifeline", lifeline)
    this.lifelines[lifeline].used = true
    switch (lifeline) {
      case "50/50":
        let myGame = gameManager.findGame(this.gameId)
        let currentQuestion = myGame.getCurrentQuestion()
        let correctAnswerIndex = currentQuestion.correct
        let wrongAnswerIndices = []
        for (let i = 0; i < currentQuestion.a.length; i++) {
          if (i !== correctAnswerIndex) {
            wrongAnswerIndices.push(i)
          }
        }
        // Remove one wrong answer
        wrongAnswerIndices.splice(Math.floor(Math.random() * wrongAnswerIndices.length), 1)
        return {
          "lifeLineName": lifeline,
          "wrongAnswerIndices": wrongAnswerIndices,
        }

        break;

      case "Ask the Audience":
        let percentages = this.getPercentages()
        return {
          "lifeLineName": lifeline,
          "percentages": percentages,
        }
        break;

      case "Phone a Friend":
        break;

      default:
        console.log("Invalid lifeline", lifeline)
        break;
    }
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