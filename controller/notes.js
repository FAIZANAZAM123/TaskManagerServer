const { connection } = require('../utils/connection');

exports.addnote=async (req, resp)=> {
    const { taskId, userid, note } = req.body;
 



    const data={
        userid:userid,
        taskId:taskId,
        note:note,
     
    }
    
    connection.query('INSERT INTO notes SET ?',data,(err,res)=>{
        if(err) throw err;
        else{
            resp.status(200).json({ message: 'success' });
        }
    })
}


exports.getallnotes = async (req, res) => {
    const { taskId } = req.query; 



    console.log("fetching nites")
    if (!taskId) {
        return res.status(400).json({ error: 'taskId is required' });
    }
    const query = `
    SELECT n.*, t.name
    FROM notes n
    INNER JOIN task t ON n.taskId = t.taskId
    WHERE n.taskId = ?
`;
connection.query(query, [taskId], (err, results) => {
    if (err) {
        console.error('Error retrieving notes:', err);
        return res.status(500).json({ error: 'Failed to retrieve notes' });
    }

    if (results.length === 0) {
        return res.status(404).json({ message: 'No notes found' });
    }

    res.status(200).json({ message: 'success', data: results });
});
};






