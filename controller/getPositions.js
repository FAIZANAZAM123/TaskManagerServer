const { connection } = require('../utils/connection');

async function GetPositions(req, resp) {
    connection.query(`
        SELECT 
            users.Id,
            users.name,
            users.level, 
            users.badge,
            COALESCE(SUM(task.points), 0) as userPoints 
        FROM 
            users 
        LEFT JOIN 
            task 
        ON 
            task.userId = users.id 
        GROUP BY 
            users.id
    `, (err, res) => {
        if (err) {
            throw err;
        } else {
            res.sort((a, b) => b.userPoints - a.userPoints);
            resp.status(200).json({ data: res });
        }
    });
}

module.exports = {
    GetPositions
};
