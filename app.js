const express = require('express')

const app = express();
const port = 5000;

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.listen(5000, () => {
    console.log(`app listening at ${port}`);
})