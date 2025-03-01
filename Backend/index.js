const mongoose = require('mongoose')
const express = require('express')

const app = express();
app.use(express.json());

app.use('/api/auth',require('./routes/auth'))
 app.use('/api/notes',require('./routes/notes'))

const port = 5000;
const mongoURL = "mongodb://localhost:27017/"

mongoose.connect(mongoURL)
    
    .then(() => {
        app.listen(port)
    })

    .then(() => {
    console.log("Connected to MongoDB")
    })

    .catch((err) => {
        console.log(err);
    })



app.get('/', (req, res) => {
    res.send('Hello World!')
})
