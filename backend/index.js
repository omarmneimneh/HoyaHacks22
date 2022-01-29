import express from "express"
import { routeConnect } from "./routes/routeConnect.js"
import { routeGame } from "./routes/routeGame.js"
import cors from "cors"

let port = process.env.PORT || 3000

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static("public"))


app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use('/connect', routeConnect)
app.use('/game', routeGame)

app.listen(port, () => {
    console.log(`Express app running on port ${port}`)
}) 

// cors
app.use(cors)