const { connection } = require('../utils/connection');

async function UpdateTask(req, resp) {
    const { name, mood, date, id, priority, recurringType } = req.query;

    // Ensure date is formatted correctly
    const formattedDate = new Date(date).toISOString().slice(0, 10);

    // Use parameterized queries to avoid SQL injection
    const query = `
        UPDATE task 
        SET name = ?, mood = ?, date = ?, priority = ?, recurring = ?
        WHERE taskId = ?`;

    connection.query(query, [name, mood, formattedDate, priority, recurringType, id], (err, res) => {
        if (err) {
            console.error("Error updating task:", err);
            resp.status(500).json({ message: 'Error updating task' });
        } else {
            resp.status(200).json({ message: 'success' });
        }
    });
}

async function updatesubtask(req, resp) {
    const { name, mood, date, id, priority } = req.query;


    console.log(name, mood, date, id, priority)
    const formattedDate = new Date(date).toISOString().slice(0, 10);

    connection.query(
        `UPDATE subtasks SET name='${name}', mood='${mood}', date='${formattedDate}', priority='${priority}' WHERE subtaskId=${id}`,
        (err, res) => {
            if (err) {
                console.error('Error updating subtask:', err);
                resp.status(500).json({ message: 'Error updating subtask' });
            } else {
                resp.status(200).json({ message: 'success' });
            }
        }
    );
}


const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const managetask = (req, resp) => {
    const { id } = req.query;

    if (!id) {
        return resp.status(400).json({ message: 'error', error: 'User ID is required' });
    }

    connection.query(`SELECT * FROM task WHERE userId = ? AND status != 'Completed'`, [id], async (err, tasks) => {
        if (err) {
            console.error(err);
            return resp.status(500).json({ message: 'error', error: err.message });
        }

        try {
            const tasksByDate = tasks.reduce((acc, task) => {
                const date = formatDate(task.date).split(' ')[0]; // Extract just the date part
                if (!acc[date]) acc[date] = [];
                acc[date].push(task);
                return acc;
            }, {});

            let distributedTasks = [];
            const taskQueue = Object.keys(tasksByDate).flatMap(date => tasksByDate[date]);

            const taskCounts = {};

            while (taskQueue.length > 0) {
                const task = taskQueue.shift();
                const date = formatDate(task.date).split(' ')[0];

                if (!taskCounts[date]) {
                    taskCounts[date] = 0;
                }

                if (taskCounts[date] < 2) {
                    distributedTasks.push(task);
                    taskCounts[date]++;
                } else {
                    let newDate = new Date(date);

                    switch (task.mood) {
                        case 'Happy':
                        case 'Sad':
                        case 'Angry':
                        case 'Excited':
                        case 'Annoyed':
                        default:
                            newDate.setDate(newDate.getDate() + 1);
                            break;
                    }

                    const newDateString = formatDate(newDate).split(' ')[0];
                    task.date = formatDate(newDate);

                    if (!taskCounts[newDateString]) {
                        taskCounts[newDateString] = 0;
                    }

                    if (taskCounts[newDateString] < 2) {
                        distributedTasks.push(task);
                        taskCounts[newDateString]++;
                    } else {
                        taskQueue.push(task); // Requeue the task to be processed again
                    }
                }
            }

            const updatePromises = distributedTasks.map(task => {
                return new Promise((resolve, reject) => {
                    connection.query(`UPDATE task SET date = ? WHERE taskId = ?`, [task.date, task.taskId], (err, result) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            });

            await Promise.all(updatePromises);

            resp.status(200).json({ message: 'success' });

        } catch (error) {
            console.error(error);
            resp.status(500).json({ message: 'error', error: error.message });
        }
    });
};




const updateorder = async (req, res) => {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ message: 'Invalid request data' });
    }

    const query = 'UPDATE task SET `order` = ? WHERE taskId = ? AND userid = ?';

    try {
        for (const task of tasks) {
            await new Promise((resolve, reject) => {
                connection.query(query, [task.order, task.taskId, task.userid], (error, results) => {
                    if (error) {
                        console.error('Error updating task order:', error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        }
        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error('Error updating task order:', error);
        res.status(500).json({ message: 'Failed to update task order' });
    }
};




module.exports = {
    UpdateTask, managetask, updatesubtask, updateorder
};
