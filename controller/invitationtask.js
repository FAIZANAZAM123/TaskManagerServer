const { connection } = require('../utils/connection');

exports.addinvitation = async (req, resp) => {
    const { taskId, senderId, recieverId } = req.query;



    if (!taskId || !senderId || !recieverId) {
        resp.status(404).json({ message: 'fields are required' });
    }

    console.log("going to subit")
    const data = {
        taskId: taskId,
        senderId: senderId,
        recieverId: recieverId,
        status: "pending"

    }

    connection.query('INSERT INTO task_invitations SET ?', data, (err, res) => {
        if (err) throw err;
        else {
            resp.status(200).json({ message: 'success' });
        }
    })
}




exports.getinvitedtasks = (req, res) => {
    const { recieverId } = req.query;


    console.log("comed here");
    if (!recieverId) {
        return res.status(400).json({ error: 'Receiver ID is required' });
    }

    connection.query('SELECT * FROM task_invitations WHERE recieverId = ? AND status <> ?', [recieverId,'accepted'], (err, results) => {
        if (err) {
            console.error('Error retrieving invitations:', err);
            return res.status(500).json({ error: 'Failed to retrieve invitations' });
        }

        if (results.length === 0) {

            return res.status(404).json({ error: 'No invitations found' });
        }

        // Send the retrieved invitations as a JSON response
        res.status(200).json({ data: results });
    });
};



exports.acceptask = (req, resp) => {
    const { invitation_id } = req.body;

    if (!invitation_id) {
        return resp.status(400).json({ error: 'Invitation ID is required' });
    }


    

    console.log(invitation_id);

    connection.query('SELECT * FROM task_invitations WHERE invitation_id = ?', [invitation_id], (err, results) => {
        if (err) {
            return resp.status(500).json({ error: 'Failed to retrieve invitation' });
        }

        if (results.length === 0) {
            return resp.status(404).json({ error: 'Invitation not found' });
        }
console.log("checking")
     
        connection.query('UPDATE task_invitations SET status = ? WHERE invitation_id = ?', ['accepted', invitation_id], (err) => {
            if (err) {
                return resp.status(500).json({ error: 'Failed to update invitation status' });
            }





        });
    });
};


// exports.acceptask=async (req, res) => {
//     const { invitationId } = req.body;

//     try {
//         await promisePool.query('UPDATE task_invitations SET status = ? WHERE invitation_id = ?', ['rejected', invitationId]);
//         res.status(200).json({ message: 'Invitation rejected' });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to reject invitation' });
//     }
// }


