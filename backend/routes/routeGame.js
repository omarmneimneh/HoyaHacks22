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
  let question = game.getQuestion(req.body.questionIndex);
  delete question.correct;
  delete question.correctText;
  res.send(question)
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

  res.status(200).send();
});

routeGame.post("/use_lifeline", (req, res) => {
  /*
  Schema for /use_lifeline
  {
    playerKey: String, // Player's unique key
    lifelineName: String, // Name of the lifeline
  }
  */
  let player = gm.findPlayerByKey(req.body.playerKey);
  let result = player.useLifeline(req.body.lifelineName);
  res.send(result);
});

export { routeGame }