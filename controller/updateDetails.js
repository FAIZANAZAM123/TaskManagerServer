const { connection } = require('../utils/connection');
const crypto = require('crypto');

async function updateDetails(req, resp) {
    const { name, email, password } = req.body;
    const image = req.file ? req.file.filename : null;
    const id=req.query.id;

    let updates = [];
    if (name) updates.push(`name='${name}'`);
    if (password) {
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        updates.push(`password='${hashedPassword}'`);
    }
    if (image) updates.push(`image='${image}'`);
    if (email) updates.push(`email='${email}'`);

    if (updates.length > 0) {
        const checkEmailQuery = `SELECT * FROM users WHERE email='${email}' AND id!='${id}'`;
        
        connection.query(checkEmailQuery, (err, res) => {
            if (err) {
                resp.status(500).json({ message: 'Database error', error: err });
            } else if (res.length > 0) {
                resp.status(400).json({ message: 'Email already in use' });
            } else {
                const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id='${id}'`;
        
                connection.query(updateQuery, (err, updateRes) => {
                    if (err) {
                        resp.status(500).json({ message: 'Database error', error: err });
                    } else {
                        // Fetch updated data after successful update
                        const fetchUpdatedQuery = `SELECT * FROM users WHERE id='${id}'`;
        
                        connection.query(fetchUpdatedQuery, (err, updatedData) => {
                            if (err) {
                                resp.status(500).json({ message: 'Database error', error: err });
                            } else {
                                resp.status(200).json({ message: 'success', data: updatedData });
                            }
                        });
                    }
                });
            }
        });
    } else {
        resp.status(400).json({ message: 'No data provided to update' });
    }
}

module.exports = {
    updateDetails
};
