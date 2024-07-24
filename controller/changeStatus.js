const { connection } = require('../utils/connection');

async function ChangeStatus(req, resp) {
    const {id} = req.query;
    connection.query(`UPDATE task SET status='${req.query.status}' WHERE taskId=${id}`,(err,res)=>{
        if(err) throw err;
        else{
            if(req.query.status=="Completed"){
                connection.query(`SELECT * FROM task WHERE taskId=${id}`,(err,res)=>{
                    if(err) throw err;
                    else{
                        let points=0;
                        if (res[0].mood == "Happy") {
                            const pointsArray = [5, 6, 7];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        } else if (res[0].mood == "Sad") {
                            const pointsArray = [6, 7, 8];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        } else if (res[0].mood == "Angry") {
                            const pointsArray = [6, 7];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        } else if (res[0].mood == "Hopeful") {
                            const pointsArray = [5, 6];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        } else if (res[0].mood == "Disappointed") {
                            const pointsArray = [8, 9, 10];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        }                        
                        connection.query(`UPDATE task SET points=${points} WHERE taskId=${id}`,(err,res)=>{
                            if(err) throw err;
                            else{
                                let level=0;
                                let badge='';
                                connection.query(`SELECT 
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
                                    WHERE users.Id=${req.query.userid}
                                    GROUP BY 
                                        users.id`,(err,resu)=>{
                                
                                    if(err) throw err;
                                    else{
                                        if(resu[0].userPoints>=300){
                                            level=2;
                                            badge='gold';
                                        }
                                        else if(resu[0].userPoints>=500){
                                            console.log('hi');
                                            level=3;
                                            badge='platinum';
                                        }
                                        if(level!=0 && badge!=''){
                                            connection.query(`UPDATE users SET level=${level}, badge='${badge}' WHERE Id=${req.query.userid}`,(err,res)=>{
                                                if(err) throw err;
                                                else{
                                                    resp.status(200).json({ message:"success" }); 
                                                }
                                            })
                                        }
                                        else{
                                            resp.status(200).json({ message:"success" }); 
                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else{
                resp.status(200).json({ message:"success" });
            }
        }
    })
}



async function changesubtaskstatus(req, resp) {
    const {id} = req.query;
    connection.query(`UPDATE subtasks SET status='${req.query.status}' WHERE subtaskId=${id}`,(err,res)=>{
        if(err) throw err;
        else{
            if(req.query.status=="Completed"){
                connection.query(`SELECT * FROM subtasks WHERE subtaskId=${id}`,(err,res)=>{
                    if(err) throw err;
                    else{
                        let points=0;
                        if (res[0].mood == "Happy") {
                            const pointsArray = [5, 6, 7];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        } else if (res[0].mood == "Sad") {
                            const pointsArray = [6, 7, 8];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        } else if (res[0].mood == "Angry") {
                            const pointsArray = [6, 7];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        } else if (res[0].mood == "Hopeful") {
                            const pointsArray = [5, 6];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        } else if (res[0].mood == "Disappointed") {
                            const pointsArray = [8, 9, 10];
                            points = pointsArray[Math.floor(Math.random() * pointsArray.length)];
                        }                        
                       
                    }
                })
            }
            else{
                resp.status(200).json({ message:"success" });
            }
        }
    })
}

module.exports = {
    changesubtaskstatus,ChangeStatus
};
