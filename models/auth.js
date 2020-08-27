const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/texts.sqlite');

const auth = {
    register: function(res, body) {
    const email = body.email;
    const password = body.password;

    db.run("INSERT INTO users (email, password) VALUES (?, ?)",
        email,
        password, (err) => {
            if (err) {
                return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/register",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }

            res.status(201).json({
                data: {
                    message: "User successfully registered."
                }
            });
        });
    }
}

module.exports = auth;
