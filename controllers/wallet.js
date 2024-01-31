const db = require('../server')

exports.edituserbalance = async(req, res) => {
    const { user } = req.params;
    const { balance, profit } = req.body;

    if (!balance) {
        res.json({ error: true, status: 401, message: "Balance cannot be empty!"})
        return;
    }

    if (!profit) {
        res.json({ error: true, status: 401, message: "Profit balance cannot be empty!"})
        return;
    }

    db.query(`SELECT id FROM users WHERE id=?`, [ user ], (err, result) => {
        if (err) throw err;
        if(result.length < 1) {
            res.json({ error: true, status: 401, message: "You are not logged in!"})
            return;
        } else {
            db.query(`UPDATE users SET balance=?, profitbalance=? WHERE id=?`, [ parseInt(balance), parseInt(profit), user ], (err, result) => {
                if(err) throw err;
                res.json({ error: false, status: 200, message: "Balance updated successfully!" });
                return;
            })
        }
    })
}

exports.topup = async(req, res) => {
    const dailytopup = async(parseddata) => {
        await Promise.all(parseddata.map((data, index) => {
            if (data.package == "starter") {
                let profit = 0.025*data.amount;
                db.query(`UPDATE deposits SET remaining=remaining - 1 WHERE investor=? AND package=? AND id=?`, [data.investor, data.package, data.id], (err, result) => {
                    if(err) throw err;
                    db.query(`INSERT INTO earnings(type, earner, referee, amount, date) VALUES (?,?,?,?, NOW())`, [ "daily" ,data.investor, 0, profit ], (err, result) => {
                        if(err) throw err;
                    })
                })
            }
    
            if (data.package == "basic") {
                let profit = 0.02*data.amount;
                db.query(`UPDATE deposits SET remaining=remaining - 1 WHERE investor=? AND package=? AND id=?`, [data.investor, data.package, data.id], (err, result) => {
                    if(err) throw err;
                    db.query(`INSERT INTO earnings(type, earner, referee, amount, date) VALUES (?,?,?,?, NOW())`, [ "daily" ,data.investor, 0, profit ], (err, result) => {
                        if(err) throw err;
                    })
                })
            }
    
            if (data.package == "advanced") {
                let profit = (0.15/14)*data.amount;
                db.query(`UPDATE deposits SET remaining=remaining - 1 WHERE investor=? AND package=? AND id=?`, [data.investor, data.package, data.id], (err, result) => {
                    if(err) throw err;
                    db.query(`INSERT INTO earnings(type, earner, referee, amount, date) VALUES (?,?,?,?, NOW())`, [ "daily" ,data.investor, 0, profit ], (err, result) => {
                        if(err) throw err;
                    })
                })
            }
    
            if (data.package == "long term") {
                let profit = (0.25/30)*data.amount;
                db.query(`UPDATE deposits SET remaining=remaining - 1 WHERE investor=? AND package=? AND id=?`, [data.investor, data.package, data.id], (err, result) => {
                    if(err) throw err;
                    db.query(`INSERT INTO earnings(type, earner, referee, amount, date) VALUES (?,?,?,?, NOW())`, [ "daily" ,data.investor, 0, profit ], (err, result) => {
                        if(err) throw err;
                    })
                })
            }
        }))
    }

    db.query(`SELECT id, package, amount, validity, remaining, investor, approved FROM deposits WHERE remaining > 0 AND approved=?`, [ true ], async(err, result) => {
        if (err) throw err;
        if(result.length < 1) {
            res.json({ error: true, status: 200, message: "No active investment plans!"})
            return;
        }
        try {
            await dailytopup(result);
            res.json({ error: false, status: 200, message: "Daily payments successful!" });
            return;
        } catch (error) {
            console.log(error.message)
        }
    })
}

exports.payday = async(req, res) => {
    const payout = async(parseddata) => {
        await Promise.all(parseddata.map((data, index) => {
            if (data.package == "starter") {
                let profit = data.amount+(0.05*data.amount);
                db.query(`UPDATE users SET profitbalance=profitbalance + ? WHERE id=?`, [ profit, data.investor ], (err, result) => {
                    if(err) throw err;
                    db.query(`UPDATE deposits SET remaining=? WHERE investor=?`, [0, data.investor], (err, result) => {
                        if(err) throw err;
                    })
                })
            }
    
            if (data.package == "basic") {
                let profit = data.amount+(0.1*data.amount);
                db.query(`UPDATE users SET profitbalance=profitbalance + ? WHERE id=?`, [ profit, data.investor ], (err, result) => {
                    if(err) throw err;
                    db.query(`UPDATE deposits SET remaining=? WHERE investor=?`, [0, data.investor], (err, result) => {
                        if(err) throw err;
                    })
                })
            }
    
            if (data.package == "advanced") {
                let profit = data.amount+(0.15*data.amount);
                db.query(`UPDATE users SET profitbalance=profitbalance + ? WHERE id=?`, [ profit, data.investor ], (err, result) => {
                    if(err) throw err;
                    db.query(`UPDATE deposits SET remaining=? WHERE investor=?`, [0, data.investor], (err, result) => {
                        if(err) throw err;
                    })
                })
            }
    
            if (data.package == "long term") {
                let profit = data.amount+(0.25*data.amount);
                db.query(`UPDATE users SET profitbalance=profitbalance + ? WHERE id=?`, [ profit, data.investor ], (err, result) => {
                    if(err) throw err;
                    db.query(`UPDATE deposits SET remaining=? WHERE investor=?`, [0, data.investor], (err, result) => {
                        if(err) throw err;
                    })
                })
            }
        }))
    }

    db.query(`SELECT id, package, amount, validity, remaining, investor, DATE(ADDDATE(date, validity)) AS duedate, approved FROM deposits WHERE DATE(ADDDATE(date, validity)) = CURDATE() AND approved=?`, [ true ], async(err, result) => {
        if (err) throw err;
        if(result.length < 1) {
            res.json({ error: false, status: 200, message: "No expiring plans today!"})
            return;
        }
        try {
            await payout(result);
            res.json({ error: false, status: 200, message: "Investors received payments today!" });
            return;
        } catch (error) {
            console.log(error.message)
        }
    })
}