// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv').config({ path: './.env' });
const db = require('../server');
// const { promisify } = require('util');
// const path = require('path');

exports.isLoggedIn = async(req, res, next) => {
    const { email } = req.query;

    if (email){
        try {
            db.query(`SELECT id, fullname, username, email, role, referrer, settlement, balance, profitbalance FROM users WHERE email = ?`, [email], (error, result) => {
                if (error) throw error;

                if (!result) {
                    return next();
                }

                req.user = result[0];
                return next();
            })
        } catch (error) {
            console.log(error);
        }

    } else {
        next();
    }

}

exports.register = async(req, res) => {
    let { fullname, email, username, password, referrer } = req.body;
    let fullnameRegex = /^([a-zA-Z ]+)$/;
    let usernameRegex = /^([a-zA-Z0-9\-_]+)$/;
    let emailRegex = /^([a-zA-Z0-9\.\-_]+)@([a-zA-Z0-9\-]+)\.([a-z]{2,10})(\.[a-z]{2,10})?$/;
    let referrerId;

    // check for empty fields
    if (!fullname || !email || !username || !password) {
        res.json({ error: true, status: 401, message: "please, fill in all fields!"})
        return;
    }

    // check for fullname REGEX
    if (!fullnameRegex.test(fullname)) {
        res.json({ error: true, status: 401, message: "fullname format not proper!"})
        return;
    }

    // check for username REGEX
    if (!usernameRegex.test(username)) {
        res.json({ error: true, status: 401, message: "username format not proper!"})
        return;
    }

    // check for email REGEX
    if (!emailRegex.test(email)) {
        res.json({ error: true, status: 401, message: "email format not proper!"})
        return;
    }

    username = username.toLowerCase();
    email = email.toLowerCase().replace(/ /g, "_");

    db.query("SELECT email FROM users WHERE email=?", [email], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.json({ error: true, status: 401, message: "email address already exists!"})
            return;
        } else{
            db.query("SELECT username FROM users WHERE username=?", [username], (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    res.json({ error: true, status: 401, message: "username already taken!"})
                    return;
                } else {
                    db.query("SELECT id FROM users WHERE username=?", [referrer], (err, result) => {
                        if (err) throw err;
                        if (result.length < 1) {
                            referrerId = 0;
                        } else {
                            referrerId = result[0].id;
                        }

                        const INSERTQUERY = `INSERT INTO users (fullname, username, email, role, referrer, settlement, balance, profitbalance, password)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

                        db.query(INSERTQUERY, [fullname, username, email, 'investor', referrerId, false, 0, 0, password], (err, result) => {
                            if (err) throw err;
                            res.json({ error: false, status: 200, message: "Your account was created successfully!", user: result[0]})
                        })
                        return;
                    })
                }
            })
        }
    })
}

exports.login = async(req, res) => {
    let { username, password } = req.body;
    let usernameRegex = /^([a-zA-Z0-9\-_]+)$/;

    // check for empty fields
    if (!username || !password) {
        res.json({ error: true, status: 401, message: "please, fill in all fields!"})
        return;
    }

    // check for username REGEX
    if (!usernameRegex.test(username)) {
        res.json({ error: true, status: 401, message: "username format not proper!"})
        return;
    }

    username = username.toLowerCase();

    db.query("SELECT id, fullname, username, email, role, balance, profitbalance FROM users WHERE username=? AND password=?", [username, password], (err, result) => {
        if (err) throw err;
        if (result.length < 1) {
            res.json({ error: true, status: 401, message: "username or password is incorrect!"})
            return;
        } else {
            res.json({ error: false, status: 200, message: `Welcome back, ${result[0]?.username}`, user: result[0]})
            return;
        }
    })
}

exports.logout = async(req, res) => {
    res.cookie(
        'botexfinance',
         'logout',
            {
                // maxAge: new Date(Date.now() * 90*24*60*60*1000),
                maxAge: 1000,
                // expire : new Date(Date.now() * 90*24*60*60*1000),
                httpOnly: true,
                secure: true
            }
    );
    res.json({error: false, statusCode: 200, message: `Goodbye!`});
}