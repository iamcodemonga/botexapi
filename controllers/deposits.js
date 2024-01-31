const db = require('../server')

exports.alldeposits = async(req, res) => {
    let { start, limit } = req.query;

    if (!start || !limit) {
        res.json({ error: true, status: 401, deposits: [] })
        return;
    }

    db.query(`SELECT id, package, method, amount, validity, remaining, investor, DATE_FORMAT(ADDDATE(date, validity), '%D %M, %Y') AS duedate, approved FROM deposits ORDER BY id DESC LIMIT ? OFFSET ?`, [ parseInt(limit), parseInt(start) ], (err, result) => {
        if(err) throw err;
        res.json({ error: false, status: 200, deposits: result })
        return;
    })
}

exports.getuserdeposits = async(req, res) => {
    let { start, limit } = req.query;

    if (!start || !limit) {
        res.json({ error: true, status: 401, deposits: [] })
        return;
    }

    const { user } = req.params;

    db.query(`SELECT id, package, method, amount, validity, remaining investor, DATE_FORMAT(ADDDATE(date, validity), '%D %M, %Y') AS duedate, approved FROM deposits WHERE investor=? ORDER BY id DESC LIMIT ? OFFSET ?`, [ user, parseInt(limit), parseInt(start) ], (err, result) => {
        if(err) throw err;
        res.json({ error: false, status: 200, deposits: result })
        return;
    })
}

exports.adduserdeposit = async(req, res) => {
    const { user } = req.params;
    const { plan, method, amount } = req.body;
    const validity = (plan == "starter" ? 2 : (plan == "basic" ? 5 : (plan == "advanced" ? 14 : (plan == "long term" ? 30 : 0))))

    const packages = [ "starter", "basic", "advanced", "long term" ]

    if (!plan || !method || !amount) {
        res.json({ error: true, status: 401, message: "please, fill in all fields!"})
        return;
    }

    if (!packages.includes(plan)) {
        res.json({ error: true, status: 401, message: "Invalid Investment package!"})
        return;
    }

    db.query(`SELECT id FROM users WHERE id=?`, [ user ], (err, result) => {
        if (err) throw err;
        if(result.length < 1) {
            res.json({ error: true, status: 401, message: "You are not logged in!"})
            return;
        } else {
            db.query(`INSERT INTO deposits ( package, method, amount, validity, remaining, investor, date, approved ) VALUES (?,?,?,?,?,?, NOW(),?)`, [ plan, method, amount, validity, validity, user, false ], (err, result) => {
                if(err) throw err;
                res.json({ error: false, status: 200, message: "successful!"})
                return;
            })
        }
    })

}

exports.approveuserdeposit = async(req, res) => {
    const { id } = req.params;
    let referrer, amount, investor, package, bonus;

    db.query(`SELECT id, amount, investor, package FROM deposits WHERE id=? AND approved=?`, [id, false], (err, result) => {
        if(err) throw err;
        if (result.length < 1) {
            res.json({ error: true, status: 401, message: 'Transaction cleared or doesn\'t exists!' });
            return;
        } else {
            amount = result[0].amount;
            bonus = amount*0.1;
            investor = result[0].investor;
            package = result[0].package;
            db.query(`SELECT referrer, settlement, balance, profitbalance FROM users WHERE id=?`, [ investor ], (err, result) => {
                if(err) throw err;
                referrer = result[0].referrer;
                if (result[0].referrer == 0 || result[0].settlement == true) {
                    // approve the deposit
                    db.query(`UPDATE deposits SET approved=? WHERE id=?`, [ true, id ], (err, result) => {
                        if(err) throw err;
                        // update user balance record
                        db.query(`UPDATE users SET balance=balance + ? WHERE id=?`, [ amount, investor ], (err, result) => {
                            if(err) throw err;
                            res.json({ error: false, status: 200, message: "successful" });
                            return;
                        })
                    })
                } else {
                    // approve the deposit
                    db.query(`UPDATE deposits SET approved=? WHERE id=?`, [ true, id ], (err, result) => {
                        if(err) throw err;
                        // update referrer profit balance
                        db.query(`UPDATE users SET profitbalance=profitbalance + ? WHERE id=?`, [ bonus, referrer ], (err, result) => {
                            if(err) throw err;
                            db.query(`UPDATE users SET balance=balance + ?, settlement=? WHERE id=?`, [ amount, true, investor ], (err, result) => {
                                if(err) throw err;
                                db.query(`INSERT INTO earnings(type, earner, referee, amount, date) VALUES (?,?,?,?, NOW())`, [ "referral" ,referrer, investor, bonus ], (err, result) => {
                                    if(err) throw err;
                                    res.json({ error: false, status: 200, message: "successful" });
                                    return;
                                })
                            })
                        })
                    })
                }
            })
        }
    })

}