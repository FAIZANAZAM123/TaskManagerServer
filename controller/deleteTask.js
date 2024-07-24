const { connection } = require('../utils/connection');

async function DeleteTask(req, resp) {
    const {taskid} = req.query;
    connection.query(`DELETE FROM task WHERE taskId=${taskid}`,(err,res)=>{
        if(err) throw err;
        else{
            resp.status(200).json({ message:"success" });
        }
    })
}


async function deletesubtask(req, resp) {
    const {taskid} = req.query;
    connection.query(`DELETE FROM subtasks WHERE subtaskId=${taskid}`,(err,res)=>{
        if(err) throw err;
        else{
            resp.status(200).json({ message:"success" });
        }
    })
}




module.exports = {
    DeleteTask,deletesubtask
};
