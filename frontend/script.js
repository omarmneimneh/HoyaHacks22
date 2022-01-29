//Open modal 
const collabs = document.getElementById('collabs')

collabs.addEventListener('click', ()=>{
    const modal = document.querySelector('.modal')
    modal.classList.add('show')
    const close = document.getElementById('close')
    close.addEventListener('click', ()=>{
        modal.classList.remove('show')
    })
})


// Page management
let page = "quiz"
function changePage(gotoPage) {
    $("#page-" + page).fadeOut(200, () => {
        $("#page-" + gotoPage).fadeIn()
    })
    page = gotoPage
}
$(".page").hide() // Hide all pages
$("#page-quiz").show()

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
    await createGame()
}
let deviceId = Math.random().toString().slice(2)
let currentQuestion = "<p>Loading...</p>"
let currentAnswers = []
let currentPrize = prizes[currentQuestion]
let players = []
let playerId = null
let playerName = "Guest"
let gameId = null

async function api(uri, payload) {
    console.log("API call:", uri, payload)
    let serverAddress = "http://localhost:3000/"
    const res = await fetch(serverAddress + uri, {
        method: payload ? "POST" : "GET",
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer', 
        body: payload ? JSON.stringify(payload) : null
      });
    let json = await res.json()
    console.log("%c" + JSON.stringify(json), 'background: #000; color: #00ff00')
    return json
}

async function connectToServer() {
    let payload = {
        name: playerName,
        deviceId: deviceId
    }
    let data = await api("connect/guest_login", payload)
    playerId = data.id
    $("#playerName").html(data.name)
}

async function createGame() {
    let payload = {
        hostId: playerId
    }
    let data = await api("connect/new_game", payload)
    gameId = data.id
    let joinLink = `${window.location.origin}?join=${data.inviteCode}`;
    $("#inviteCodeArea").html(joinLink)
}

async function joinGame() {
    let payload = {
        gameId: gameId,
        playerId: playerId
    }
    let data = await api("connect/join_game", payload)
    playerId = data.id
    $("#playerName").html(data.name)
}

async function leaveGame() {
    let payload = {
        gameId: gameId,
        playerId: playerId
    }
    let data = await api("connect/leave_game", payload)
    alert("You have left the game")
}
