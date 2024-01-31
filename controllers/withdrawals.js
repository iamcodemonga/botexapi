const db = require('../server')

exports.allwithdrawals = async(req, res) => {
    let { start, limit } = req.query;

    if (!start || !limit) {
        res.json({ error: true, status: 401, withdrawals: [] })
        return;
    }

    db.query(`SELECT * FROM withdrawals ORDER BY id DESC LIMIT ? OFFSET ?`, [ parseInt(limit), parseInt(start) ], (err, result) => {
        if(err) throw err;
        res.json({ error: false, status: 200, withdrawals: result })
        return;
    })
}

exports.getuserwithdrawals = async(req, res) => {
    let { start, limit } = req.query;

    if (!start || !limit) {
        res.json({ error: true, status: 401, withdrawals: [] })
        return;
    }

    const { user } = req.params;

    db.query(`SELECT * FROM withdrawals WHERE investor=? ORDER BY id DESC LIMIT ? OFFSET ?`, [ user, parseInt(limit), parseInt(start) ], (err, result) => {
        if(err) throw err;
        res.json({ error: false, status: 200, withdrawals: result });
        return;
    })
}

exports.request = async(req, res) => {
    const { user } = req.params;
    const { wallet, method, amount } = req.body;

    if (!wallet || !method || !amount) {
        res.json({ error: true, status: 401, message: "please, fill in all fields!"})
        return;
    }

    if (amount <= 0) {
        res.json({ error: true, status: 401, message: "You can't withdraw nothing!"})
        return;
    }

    db.query(`SELECT id, profitbalance FROM users WHERE id=?`, [ user ], (err, result) => {
        if (err) throw err;

        if(result.length < 1) {
            res.json({ error: true, status: 401, message: "You are not logged in!"})
            return;
        }

        if (result[0].profitbalance < amount) {
            res.json({ error: true, status: 401, message: `You can't withdraw more than $${result[0].profitbalance}!`})
            return;
        }
        
        db.query(`INSERT INTO withdrawals ( investor, method, wallet, amount, date, approved ) VALUES (?,?,?,?, NOW(),?)`, [ user, method, wallet, amount, false ], (err, result) => {
            if(err) throw err;
            res.json({ error: false, status: 200, message: "successful!"})
            return;
        })
    })
}

exports.approvewithdrawal = async(req, res) => {
    const { id } = req.params;
    let amount, investor, profit, balance;

    db.query(`SELECT id, amount, investor FROM withdrawals WHERE id=? AND approved=?`, [id, false], (err, result) => {
        if(err) throw err;
        if (result.length < 1) {
            res.json({ error: true, status: 401, message: 'Request already approved or doesn\'t exist!' });
            return;
        } else {
            amount = result[0].amount;
            investor = result[0].investor;
            db.query(`SELECT balance, profitbalance FROM users WHERE id=?`, [ investor ], (err, result) => {
                if(err) throw err;
                profit = result[0].profitbalance;
                balance = result[0].balance;

                if (amount > profit) {
                    res.json({ error: true, status: 401, message: `User can't withdraw more than $${profit}!` });
                    return;
                }

                db.query(`UPDATE withdrawals SET approved=? WHERE id=?`, [ true, id ], (err, result) => 
                {
                    if(err) throw err;
                    db.query(`UPDATE users SET profitbalance=profitbalance - ? WHERE id=?`, [ amount, investor ], (err, result) => {
                        if(err) throw err;
                        res.json({ error: false, status: 200, message: "successful" });
                        return;
                    })
                })
            })
        }
    })
}