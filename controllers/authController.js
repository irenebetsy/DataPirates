const bcrypt = require("bcryptjs");
const { sql } = require("../config/db");

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await sql.query`
            SELECT "UserID", "Name", "Email", "Password"
            FROM "Users"
            WHERE "Email" = ${email}
        `;

        if (result.recordset.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        const user = result.recordset[0];

        const passwordMatches = await bcrypt.compare(password, user.Password);

        if (!passwordMatches) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        res.json({

            success: true,

            message: "Login successful",

            user: {
                id: user.UserID,
                name: user.Name,
                email: user.Email
            }

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

module.exports = {

    login

};
