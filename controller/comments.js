const { connection } = require('../utils/connection');

exports.addcomment=async (req, resp)=> {
    const { taskId, userid, comment } = req.body;
    const {id} = req.query;



    const data={
        userid:userid,
        taskId:taskId,
        comment:comment,
     
    }
    
    connection.query('INSERT INTO comments SET ?',data,(err,res)=>{
        if(err) throw err;
        else{
            resp.status(200).json({ message: 'success' });
        }
    })
}


