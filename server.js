const path = require('path')
const express = require('express')

const app = express()

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.status(200).render('index',{
        title: 'quizApp'
    })
})



const port = 3000
app.listen(port, () => {
    console.log(`app is running on port ${port}`)
})