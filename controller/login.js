const { connection } = require('../utils/connection');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');



async function Login(req, resp) {
    
    const secretKey = process.env.secret_key;
    try {
        const data=JSON.parse(req.body.body);
        const email = data.email;
        const password = crypto.createHash('sha256').update(data.password).digest('hex');
        connection.query(`SELECT * FROM users WHERE email='${email}' and password='${password}'`,(err,res)=>{
            if(err) throw err;
            else{
                if(res.length>0){
                      const userData = {
                        email: email,
                        userId: res[0].id,
                      };
                      const token = jwt.sign(userData, secretKey, { expiresIn: '1h' });
                    resp.status(200).json({ message: 'success', email: email, name:res[0].name, token: token, id:res[0].Id, image:res[0].image, level:res[0].level, badge:res[0].badge });
                }
                else{
                    resp.status(200).json({ message: 'failure' });
                }
            }
        })
    } catch (error) {
        console.error(error);
        resp.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    Login
};
