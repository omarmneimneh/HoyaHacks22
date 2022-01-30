


// Page management
let page = "welcome"
function changePage(gotoPage) {
    $("#page-" + page).fadeOut(150, () => {
        $("#page-" + gotoPage).fadeIn(150)
    })
    page = gotoPage
}
$(".page").hide() // Hide all pages
$("#page-"+page).show()

// Interactive content management
let content = "start"
function changeContent(gotoContent) {
    $("#content-" + content).hide()
        $("#content-" + gotoContent).show()
    
    content = gotoContent
}
$(".content").hide() // Hide all pages
$("#content-"+content).show()

// Copy function
function copyTextarea(id) {
    var copyText = document.getElementById(id);
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    navigator.clipboard.writeText(copyText.value);
}
function copy(text) { // Less reliable than copyTextarea
    let element = document.createElement('textarea');
    element.value = text;
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);
}


// Prize money for "Who Wants To Be A Millionaire"
let prizes = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]
$(document).ready(init);
async function init() {
 //   $("#prizesList").html(prizes.map(p => `<li id="prize-${p}" class="prize">${p}</li>`).join(""))


    playerName = "test" //prompt("What should other players call you?")
    await connectToServer()
    

    // Get URL query parameters
    let inviteCode = window.location.href.split("=")[1]
    if (inviteCode) {
        joinGame(inviteCode)
    }

}
let playerKey = "" // Use this to authenticate player
let deviceId = Math.random().toString().slice(2)
let currentQuestion = "<p>Loading...</p>"
let currentAnswers = []
let questionIndex = 0
let answerIndex = -1
let currentPrize = prizes[currentQuestion]
let players = []
let playerId = null
let playerName = "Guest"
let gameId = null
let gameName = ""
let participateAsHost = false
let timer = 60 // seconds. when timer reaches 0, request the correct answer AND the next question
let isWaitingForOtherPlayers = false

if (page === "quiz") {
    fetchAndPopulateQuestion("random")
}

async function api(uri, payload) {
    let isPostMethod = payload !== "GET"
    if (isPostMethod) {
        if (!payload) {
            payload = {}
        }
        payload.playerKey = playerKey
    }
    console.log("API call:", uri, payload)
    let serverAddress = "http://localhost:3000/"
    //let serverAddress = "https://fast-river-99233.herokuapp.com/"
    const res = await fetch(serverAddress + uri, {
        method: isPostMethod ? "POST" : "GET",
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer', 
        body: isPostMethod ? JSON.stringify(payload) : null
      });
    if (res.status !== 200) {
        let txt = await res.text()
        console.log(txt)
        return {error: true}
    }
    let json = await res.json()
    console.log("%c" + JSON.stringify(json), 'background: #000; color: #00ff00')
    return json
}

/* Connect routes */
async function connectToServer(_playerName) {
    playerName = _playerName || playerName
    let playerData = await api("connect/guest_login", {
        name: playerName,
        deviceId: deviceId
    })
    playerId = playerData.id
    playerKey = playerData.playerKey
    $("#playerName").html(playerData.name)
}
async function createGame() {
    let gameData = await api("connect/new_game", {
        name: gameName,
        participateAsHost
    })
    gameId = gameData.id
    let joinLink = `${window.location.origin}?join=${gameData.inviteCode}`;
    updateShareButtons()
    $("#inviteCodeArea").html(joinLink)
}
async function joinGame(inviteCode) {
    let gameData = await api("connect/join_game", { inviteCode })
    gameId = gameData.id
    await startQuiz()
    changePage("quiz")
    
}
async function leaveGame() {
    await api("connect/leave_game", { gameId })
    alert("You have left the game")
}
async function startQuiz() {
    let quizData = await api("connect/start_quiz", { gameId })
    await fetchAndPopulateQuestion("current")
    changeContent("quiz")
}


/* Connect routes */
async function fetchAndPopulateQuestion(questionIndex) {
    console.log("Fetching question", questionIndex)
    let questionData
    if (questionIndex === "random") {
        questionData = await api("game/get_random_question", "GET")
    } else if (questionIndex === "current") {
        questionData = await api("game/get_current_question")
    } else {
        questionData = await api("game/get_question", { questionIndex })
    }

    // Populate question
    $("#questionText").text(questionData.q)
    $("#questionNumber").text(questionIndex + 1)

    // Populate answers
    let alphabet = "ABCD"
    for (let i = 0; i < questionData.a.length; i++) {
        let answer = questionData.a[i]
        $(`#answer-${i} button`).html(`<span class="letter">${alphabet[i]}.</span> ${answer}`)
    }
    
}
async function lockInAnswer() {
    await api("game/lock_in_answer", { answerIndex })
}
async function useLifeline(lifelineName) {
    // lifeLineName: "50-50", "Ask the Audience", "Phone a Friend", "Reqest a Hint"(?)
    let lifelineData = await api("game/use_lifeline", { lifelineName })
    switch (lifelineName) {
        case "50-50":
            // Gray-out the two wrong answers
            let wrongAnswerIndices = lifelineData.wrongAnswerIndices
            for (let i = 0; i < wrongAnswerIndices.length; i++) {
                $(`#answer-${wrongAnswerIndices[i]} button`).addClass("disabled")
            }
            break
        case "Ask the Audience":
            // Show the number of people who answered correctly

            break

        case "Phone a Friend":

            break;

    }

}
async function everyoneHasAnswer() {
    let nextQuestionIndex = questionIndex + 1;
    let waitingData = await api("game/everyone_has_answer", { nextQuestionIndex, questionIndex });
    
    if (waitingData.done) {
console.log("comparing", waitingData.questionIndex, questionIndex, "wdq", "q")
        if (waitingData.questionIndex != questionIndex) {
            console.log("NEXT")
            isWaitingForOtherPlayers = false
            questionIndex = waitingData.questionIndex
            await fetchAndPopulateQuestion(questionIndex)
            changeContent("quiz")
        } else if (waitingData.correctAnswerIndex === answerIndex) {    
            changeContent("correct")
        } else {
            changeContent("incorrect")
        }
    } else {
        $("#playersDone").text(waitingData.playersDone)
        $("#playersDoneLength").text(waitingData.playersDoneLength)
        $("#playersLength").text(waitingData.playersLength)
    }
}


/* Misc */
function clickAnswer(_answerIndex) {
    answerIndex = _answerIndex
    changeContent("confirm")
}
function confirmAnswer() {
    lockInAnswer()
    isWaitingForOtherPlayers = true
    changeContent("waiting")
}
function updateShareButtons() {
    // Twitter
    let shareLink = `${window.location.origin}?join=${gameId}`;
    let shareDescription = `Join my quiz "Who Wants To Be A Millionaire"!`
    $(".twitter-share-button")[0].href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareDescription)}&url=${encodeURIComponent(shareLink)}`
}
function submitCreateARoom() {
    gameName = $("#room-name").val()
    playerName = $("#player-name").val()
    participateAsHost = $("#participate-as-host").is(":checked")
    createGame()
    changePage("invite")
}
async function joinSolo() {
    changePage("quiz")
    await startQuiz()
    await fetchAndPopulateQuestion("current")
}


$("#your-name").change(() => {
    let name = $("#your-name").val()
    if (name.length > 1) $("#room-name").val($("#your-name").val() + "'s room")
    else $("#room-name").val("")
})

/* Intervals */
setInterval(() => {
    if (isWaitingForOtherPlayers) {
        everyoneHasAnswer()
    }
}, 2000)


