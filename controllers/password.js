const db = require('../server')

exports.changepassword = async(req, res) => {
    let { oldpassword, newpassword, confirmedpassword } = req.body;
    let { id } = req.query;

    if (!id) {
        res.json({ error: true, status: 401, message: "You are not logged in!"})
        return;
    }

    if (!oldpassword || !newpassword || !confirmedpassword) {
        res.json({ error: true, status: 401, message: "Please, fill in all fields!"})
        return;
    }

    if (newpassword != confirmedpassword) {
        res.json({ error: true, status: 401, message: "New password doesn\'t match confirmed password!"})
        return;
    }

    db.query("SELECT id FROM users WHERE id=? AND password=?", [id, oldpassword], (err, result) => {
        if(err) throw err;
        if (result.length < 1) {
            res.json({ error: true, status: 401, message: "Old password is incorrect!"})
            return;
        } else {
            db.query("UPDATE users SET password=? WHERE id=?", [newpassword, id], (err, result) => {
                if(err) throw err;
                res.json({ error: false, status: 200, message: "successful! You have changed password!", newpassword })
                return;
            })
        }
    })
}

exports.resetpassword = async(req, res) => {
    let { email } = req.body;
    let emailRegex = /^([a-zA-Z0-9\.\-_]+)@([a-zA-Z0-9\-]+)\.([a-z]{2,10})(\.[a-z]{2,10})?$/;
    function makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }
    const password = makeid(8)

    if (!email) {
        res.json({ error: true, status: 401, message: "Please, fill in your email address!", password: null })
        return;
    }

    if (!emailRegex.test(email)) {
        res.json({ error: true, status: 401, message: "email format not proper!", password: null })
        return;
    }

    email = email.toLowerCase().replace(/ /g, "_")

    db.query("SELECT id, username, email FROM users WHERE email=?", [email], (err, result) => {
        if (err) throw err;
        if (result.length < 1) {
            res.json({ error: true, status: 401, message: "email address does not exist!", password: null })
            return;
        } else {
            db.query("UPDATE users SET password=? WHERE email=?", [password, email], (err, result) => {
                if(err) throw err;
                res.json({ error: false, status: 200, message: "successful! Follow the link on your email!", password })
                return;
            })
        }
    })
}