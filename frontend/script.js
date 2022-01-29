//Open modal 
const collabs = document.getElementById('collabs')

collabs?.addEventListener('click', ()=>{
    const modal = document.querySelector('.modal')
    modal.classList.add('show')
    const close = document.getElementById('close')
    close.addEventListener('click', ()=>{
        modal.classList.remove('show')
    })
})


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
    $("#prizesList").html(prizes.map(p => `<li id="prize-${p}" class="prize">${p}</li>`).join(""))


    playerName = "test" //prompt("What should other players call you?")
    await connectToServer()
    // await createGame()

    // await fetchAndPopulateQuestion(0)
}
let playerKey = "" // Use this to authenticate player
let deviceId = Math.random().toString().slice(2)
let currentQuestion = "<p>Loading...</p>"
let currentAnswers = []
let currentPrize = prizes[currentQuestion]
let players = []
let playerId = null
let playerName = "Guest"
let gameId = null
let gameName = ""
let participateAsHost = false
let timer = 30 // seconds. when timer reaches 0, request the correct answer AND the next question

async function api(uri, payload) {
    let isPostMethod = typeof payload !== "GET"
    if (isPostMethod) {
        if (!payload) {
            payload = {}
        }
        payload.playerKey = playerKey
    }
    console.log("API call:", uri, payload)
    let serverAddress = "http://localhost:3000/"
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
async function joinGame() {
    let playerData = await api("connect/join_game", { gameId })
    playerId = playerData.id
}
async function leaveGame() {
    await api("connect/leave_game", { gameId })
    alert("You have left the game")
}
async function startQuiz() {
    await api("connect/start_quiz", { gameId })
    
}


/* Connect routes */
async function fetchAndPopulateQuestion(questionIndex) {
    let questionData = await api("game/get_question", { questionIndex })

    // Populate question
    $("#questionText").text(questionData.q)
    $("#questionNumber").text(questionIndex + 1)

    // Populate answers
    let alphabet = "ABCD"
    for (let i = 0; i < questionData.a.length; i++) {
        let answer = questionData.a[i]
        $(`#answer-${i} button`).text(`${alphabet[i]}. ${answer}`)
    }
    
}
async function lockInAnswer(answerIndex) {
    await api("game/lock_in_answer", { answerIndex })
}
async function useLifeline(lifelineName) {
    await api("game/lock_in_answer", { lifelineName })
}


/* Misc */
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
function joinSolo() {
    changePage("quiz")
    startQuiz()
}


$("#your-name").change(() => {
    let name = $("#your-name").val()
    if (name.length > 1) $("#room-name").val($("#your-name").val() + "'s room")
    else $("#room-name").val("")
})