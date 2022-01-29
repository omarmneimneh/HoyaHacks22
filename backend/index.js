import express from "express"
import { routeConnect } from "./routes/routeConnect.js"
import { routeGame } from "./routes/routeGame.js"


const app = express()
let port = 8080


app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use('/connect', routeConnect)
app.use('/game', routeGame)

app.listen(port, () => {
    console.log(`Express app running on port ${process.env.PORT || port}`)
})