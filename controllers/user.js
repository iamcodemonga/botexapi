const db = require('../server');

exports.allusers = async(req, res) => {
    let { start, limit } = req.query;

    if (!start || !limit) {
        res.json({ error: true, status: 401, users: [] })
        return;
    }

    db.query(`SELECT id, fullname, username, email, referrer, balance, password FROM users ORDER BY id DESC LIMIT ? OFFSET ?`, [ parseInt(limit), parseInt(start)], (err, result) => {
        if(err) throw err;
        res.json({ error: false, status: 200, users: result })
        return;
    })
}

exports.getallusers = async(req, res) => {
    db.query(`SELECT id, fullname, username, email, referrer, balance, profitbalance FROM users WHERE username != ? ORDER BY id DESC`, [ "admin" ], (err, result) => {
        if(err) throw err;
        res.json({ error: false, status: 200, users: result })
        return;
    })
}

exports.getuser = async(req, res) => {
    let investments, withdrawals, refbonuses;
    let totaldeposits, verifiedpayments, pendingrequests;
    const profile = req.user;

    if (!profile) {
        res.json({})
        return;
    }

    if (profile.role == "investor") {
        db.query(`SELECT SUM(amount) AS investments FROM deposits WHERE investor=? AND approved=?`, [ req.user.id, true ], (err, result) => {
            if(err) throw err;
            investments = result[0].investments;
            db.query(`SELECT SUM(amount) AS withdraw FROM withdrawals WHERE investor=? AND approved=?`, [ req.user.id, true ], (err, result) => {
                if(err) throw err;
                withdrawals = result[0].withdraw
                db.query(`SELECT SUM(amount) AS bonuses FROM earnings WHERE earner=? AND type=?`, [ req.user.id, "referral" ], (err, result) => {
                    if(err) throw err;
                    refbonuses = result[0].bonuses;
                    db.query(`SELECT SUM(amount) AS daily FROM earnings WHERE earner=? AND type=? AND DATE(date) = CURDATE()`, [ req.user.id, "daily" ], (err, result) => {
                        if(err) throw err;
                        const metrics = {
                            investments: investments == null ? 0 : investments,
                            withdrawals: withdrawals == null ? 0 : withdrawals,
                            withdrawable: req.user.profitbalance,
                            referral: refbonuses == null ? 0 : refbonuses,
                            daily: result[0].daily == null ? 0 : result[0].daily
                        }
                        res.json({ metrics, profile })
                        return;
                    })
                })
                return;
            })
        })
    }
    
    if (profile.role == "admin") {
        db.query(`SELECT SUM(amount) AS investments FROM deposits`, [ ], (err, result) => {
            if(err) throw err;
            totaldeposits = result[0].investments;
            db.query(`SELECT SUM(amount) AS payments FROM deposits WHERE approved=?`, [ true ], (err, result) => {
                if(err) throw err;
                verifiedpayments = result[0].payments
                db.query(`SELECT COUNT(id) AS requests FROM withdrawals WHERE approved=?`, [ false ], (err, result) => {
                    if(err) throw err;
                    pendingrequests = result[0].requests;
                    db.query(`SELECT COUNT(id) AS allusers FROM users WHERE role=?`, [ "investor" ], (err, result) => {
                        if(err) throw err;
                        const metrics = {
                            investments: totaldeposits == null ? 0 : totaldeposits,
                            seenpayments: verifiedpayments == null ? 0 : verifiedpayments,
                            investors: result[0].allusers == null ? 0 : result[0].allusers,
                            requests: pendingrequests == null ? 0 : pendingrequests,
                        }
                        res.json({ metrics, profile })
                        return;
                    })
                })
                return;
            })
        })
    }
}

exports.edituser = async(req, res) => {
    const { fullname } = req.body;
    const { id } = req.query;
    const fullnameRegex = /^([a-zA-Z ]+)$/;

    if (!id) {
        res.json({ error: true, status: 401, message: "You are not logged in!"})
        return;
    }

    // check for empty fields
    if (!fullname) {
        res.json({ error: true, status: 401, message: "please, fill in your fullname!"})
        return;
    }

    // check for fullname REGEX
    if (!fullnameRegex.test(fullname)) {
        res.json({ error: true, status: 401, message: "fullname format not proper!"})
        return;
    }

    db.query("SELECT id FROM users WHERE id=?", [id], (err, result) => {
        if (err) throw err;
        if (result.length < 1) {
            res.json({ error: true, status: 401, message: "No such user in our database!"})
            return;
        } else {
            db.query("UPDATE users SET fullname=? WHERE id=?", [fullname, id], (err, result) => {
                if(err) throw err;
                res.json({ error: false, status: 200, message: "successful! You have updated your profile!" })
                return;
            })
        }
    })

}

exports.bonuses = async(req, res) => {
    const { userid } = req.params;

    if (!userid) {
        res.json({ error: true, status: 401, message: "You are not logged in!"})
        return;
    }

    db.query("SELECT users.id, users.fullname, earnings.amount, DATE_FORMAT(earnings.date, '%D %M, %Y') AS refdate FROM earnings LEFT JOIN users ON users.id=earnings.referee WHERE earnings.earner=? AND users.settlement=? AND earnings.type=?", [userid, true, "referral"], (err, result) => {
        if (err) throw err;
        res.json({ error: false, status: 200, bonuses: result })
        return;
    })
}

