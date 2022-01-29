
// Page management
let page = "home"
function changePage(gotoPage) {
    $("#page-" + page).fadeOut()
    $("#page-" + gotoPage).fadeIn()
    page = gotoPage
}
$(".page").hide() // Hide all pages
changePage(page) // Goto home page



// Prize money for "Who Wants To Be A Millionaire"
let prizes = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]
$(document).ready(init);
function init() {
    $("#prizesList").html(prizes.map(p => `<li id="prize-${p}" class="prize">${p}</li>`).join(""))
    playerName = "test" //prompt("What should other players call you?")
    connectToServer()
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
