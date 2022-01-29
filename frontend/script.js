
// Prize money for "Who Wants To Be A Millionaire"
let prizePools = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]

$(document).ready(init);

function init() {
    $("#prizesList").html(prizePools.map(p => `<li id="prize-${p}" class="prize">${p}</li>`).join(""))
}

let currentQuestion = 0
let currentPrize = prizePools[currentQuestion]


let currentPlayer = 0

let players = []

let question = ""

let answers = []

let correctAnswer = ""

let correctAnswerIndex = 0

let answerIndex = 0

let answer = ""
