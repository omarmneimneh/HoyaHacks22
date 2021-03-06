import express, { Router } from "express";
const routeGame = express.Router();
import { gameManager } from "../component/game.js"; 
const gm = gameManager;

routeGame.post("/get_question", (req, res) => {
  /*
  Schema for /get_question
  {
    playerKey: String, // Auth key of the player,
    questionIndex: Number, // Index of the question to get
  }
  RETURNS
  (questions.jsonc)[questionIndex]
  */
  let player = gm.findPlayerByKey(req.body.playerKey);
  let game = gm.findGame(player.gameId);
  let question = JSON.parse(JSON.stringify(game.getQuestion(req.body.questionIndex)))
  delete question.correct;
  delete question.correctText;
  res.send(question)
});

routeGame.post("/get_current_question", (req, res) => {
  /*
  Schema for /get_question
  {
    playerKey: String, // Auth key of the player,
    questionIndex: Number, // Index of the question to get
  }
  RETURNS
  (questions.jsonc)[questionIndex]
  */
  let player = gm.findPlayerByKey(req.body.playerKey);
  let game = gm.findGame(player.gameId);
  let question = JSON.parse(JSON.stringify(game.getCurrentQuestion()))
  delete question.correct;
  delete question.correctText;
  res.send(question)
});

routeGame.get("/get_random_question", (req, res) => {
  /*
  Schema for /get_random_question
  RETURNS 
  (questions.jsonc)[RANDOM]
  */
  let question = gm.getRandomQuestion();
  res.send(question);
});



routeGame.post("/lock_in_answer", (req, res) => {
  /*
  Schema for /lock_in_answer
  {
    playerKey: String, // Player's unique key
    answerIndex: Number, // Index of the answer
  }
  */
  let player = gm.findPlayerByKey(req.body.playerKey);
  player.lockIn(req.body.answerIndex);

  res.send({});
});

routeGame.post("/use_lifeline", (req, res) => {
  /*
  Schema for /use_lifeline
  {
    playerKey: String, // Player's unique key
    lifelineName: String, // Name of the lifeline

    // For the lifeline "Phone a Friend"
    friend: String, // Name of the friend
  }
  RETURN
  {
    lifelineName: String, // Name of the lifeline

    // FOR LIFELINE "50/50"
    wrongAnswerIndices: [Number, Number], // 2 selected indices of wrong answers

    // FOR LIFELINE "Ask the Audience"
    percentages: [Number, Number, Number, Number], // 4 percentages of answers from the other players who answered

    // FOR LIFELINE "Phone a Friend"
    friendAnswerIndex: Number, // Index of the answer of the friend
  }
  */
  let player = gm.findPlayerByKey(req.body.playerKey);
  let result = player.useLifeline(req.body.lifelineName);
  res.send(result);
});

routeGame.post("/everyone_has_answer", (req, res) => {
  /*
  Schema for /everyone_has_answer
  {
    playerKey: String, // Player's unique key
    questionIndex: Number, // Index of the question to get
    nextQuestionIndex: Number, // Index of the next question
  }
  RETURN
  {
    done: Boolean, // Whether the game is done,
    playersDone: [String], // List of players who have finished the game
    playersDoneLength: Number, // Number of players who have finished the game
    playersLength: Number, // Number of players in the game

    // FOR IF GAME IS DONE
    correctAnswerIndex: Number, // Index of the correct answer
  }
  */
  let player = gm.findPlayerByKey(req.body.playerKey);
  let game = gm.findGame(player.gameId);
  let playersDone = game.players.filter(p => p.onQuestionIndex >= req.body.questionIndex);
  let playersDoneLength = playersDone.length;
  let playersLength = game.players.length;
  let done = playersDoneLength >= playersLength
  let questionIndex = game.questionIndex
  let correctAnswerIndex = game.questions[req.body.questionIndex].correct
  console.log("correctAnswerIndex", correctAnswerIndex, game.questions[req.body.questionIndex])
  if (done) {
    setTimeout(() => {
      game.questionIndex = req.body.nextQuestionIndex;
    }, 2500);
  }
  res.send({
    done: done,
    correctAnswerIndex: correctAnswerIndex,
    playersDone: playersDoneLength,
    playersDoneLength: playersDone.length,
    playersLength: playersLength,
    questionIndex: questionIndex
  });
})

export { routeGame }