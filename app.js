const express = require('express');
require("dotenv").config()
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const axios = require('axios')
const authRoute = require('./routes/auth');
const passwordRoute = require('./routes/password');
const userRoute = require('./routes/user');
const depositRoute = require('./routes/deposits');
const withdrawalRoute = require('./routes/withdrawals');
const walletRoute = require('./routes/wallet');
const app = express();

// app.use(cors({
//     origin: [ 'http://localhost:3000', 'https://botexfinance.com' ],
//     method: 'GET, POST, PUT, PATCH, DELETE',
//     credentials: true,
// }))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/password', passwordRoute);
app.use('/deposits', depositRoute);
app.use('/withdrawals', withdrawalRoute)
app.use('/wallet', walletRoute)

const dailytopup = async() => {
    // daily topup runs
    const result = await axios.put(`http://localhost:5000/wallet/topup`)
    if (result.data.status == 200) {
        console.log(result.data.message);
        // payroll clearance runs
        const data = await axios.put(`http://localhost:5000/wallet/payday`)
        console.log(data.data.message)
        return;
    }
    return;
}

const payments = cron.schedule("13 17 * * *", async() => await dailytopup(), { scheduled: false });
payments.start();

app.listen(5000, () => {
    console.log(`app listening at ${process.env.PORT}`);
})