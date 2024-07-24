const express = require('express');
const { google } = require('googleapis');
const cron = require('node-cron');
const router = express.Router();
const {connection} = require('../utils/connection');
const { oauth2Client, getToken } = require('../controller/auth.js'); // Ensure correct path
const app=express();


const checkgoogle = (req, res) => {
  const userId = req.query.id;

  console.log("here inside");

  const query = 'SELECT * FROM user_tokens WHERE user_id = ?';
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error retrieving tokens from database:', err);
      return res.status(500).json({ authenticated: false });
    }

    const tokens = results[0];
    console.log("These are the tokens", tokens);

    if (tokens) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });
}



// Function to add task to Google Calendar
const addTaskToGoogleCalendar = async (oauth2Client, taskName, dueDate) => {

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    console.error('OAuth2 client is not properly configured');
    return;
  }

  const event = {
    summary: taskName,
    start: {
      dateTime: new Date(dueDate).toISOString(),
      timeZone: 'Asia/Dhaka', // Adjust to your timezone
    },
    end: {
      dateTime: new Date(new Date(dueDate).getTime() + 60 * 60 * 1000).toISOString(), // Duration of 1 hour
      timeZone: 'Asia/Dhaka',
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    console.log('Event created:', response.data);
  } catch (error) {
    console.error('Error creating event:', error);
  }
};

// Function to handle adding task
const AddTask = async (req, resp) => {
  console.log("Going To add Task");

  const { taskName, category, dueDate, priority, mood, isRecurring, recurringType } = req.body;
  const { id: userId } = req.query;

  console.log('Received Data:', { taskName, category, dueDate, priority, mood, isRecurring, recurringType });

  const data = {
    userid: userId,
    name: taskName,
    mood: mood,
    date: dueDate,
    status: 'Pending',
    priority: priority,
    recurring: recurringType,
  };

  // Insert data into the database
  connection.query('INSERT INTO task SET ?', data, async (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return resp.status(500).json({ message: 'Failed to insert data' });
    }

    console.log('Data inserted successfully:', result);

    // Retrieve tokens for the user
    const query = 'SELECT * FROM user_tokens WHERE user_id = ?';
    connection.query(query, [userId], async (err, results) => {
      if (err) {
        console.error('Error retrieving tokens from database:', err);
        return resp.status(500).json({ authenticated: false });
      }

      const tokens = results[0];
      console.log("These are the tokens", tokens);

      if (tokens) {
        oauth2Client.setCredentials(tokens);
        await addTaskToGoogleCalendar(oauth2Client, taskName, dueDate);

        // Handle recurring tasks
        if (recurringType === 'Weekly') {
          scheduleTaskExtension(result.insertId, 7);
        } else if (recurringType === 'Monthly') {
          scheduleTaskExtension(result.insertId, 30); // Extend by 30 days
        }

        resp.status(200).json({ message: 'Task added successfully' });
      } else {
        console.error('No tokens found');
        resp.status(401).json({ message: 'User not authenticated with Google' });
      }
    });
  });
};


// Function to schedule task extension
const scheduleTaskExtension = (taskId, intervalDays) => {
  const interval = intervalDays === 7 ? '0 0 * * 1' : '0 0 1 * *';

  cron.schedule(interval, async () => {
    connection.query('SELECT * FROM task WHERE taskId = ?', [taskId], async (err, results) => {
      if (err) {
        console.error('Error fetching task:', err);
        return;
      }

      if (results.length > 0) {
        const task = results[0];
        const newDate = new Date(task.date);
        newDate.setDate(newDate.getDate() + intervalDays);

        connection.query('UPDATE task SET date = ?, status = \'Pending\' WHERE taskId = ?', [newDate.toISOString().slice(0, 10), taskId], async (err, result) => {
          if (err) {
            console.error('Error updating task:', err);
          } else {
            console.log('Task extended successfully:', result);

            // Add the updated task to Google Calendar
            await addTaskToGoogleCalendar(task.name, newDate);
          }
        });
      }
    });
  });
};













// async function AddTask(req, resp) {
//     const { taskName, category, dueDate, priority, mood, isRecurring, recurringType } = req.body;
//     const { id } = req.query;

//     console.log('Received Data:', { taskName, category, dueDate, priority, mood, isRecurring, recurringType });

//     const data = {
//         userid: id,
//         name: taskName,
//         mood: mood,
//         date: dueDate,
//         status: 'Pending',
//         priority: priority,
//         recurring: recurringType,
//     };

//     // Insert data into the database
//     connection.query('INSERT INTO task SET ?', data, (err, result) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             return resp.status(500).json({ message: 'Failed to insert data' });
//         }
//         console.log('Data inserted successfully:', result);
//         resp.status(200).json({ message: 'success' });

//         if (recurringType === 'Weekly') {

//             console.log("Sheduling succesfull")
//             scheduleTaskExtension(result.insertId, 7);
//             console.log("Sheduling succesfullyyyy")

//         } else if (recurringType === 'Monthly') {
//             scheduleTaskExtension(result.insertId, 30); // Extend by 30 days
//         }
//     });
// }

// function scheduleTaskExtension(taskId, intervalDays) {
//     const interval = intervalDays === 7 ? '0 0 * * 1' : '0 0 1 * *';

//     cron.schedule(interval, () => {
//         connection.query(`SELECT * FROM task WHERE taskId = ?`, [taskId], (err, results) => {
//             if (err) {
//                 console.error('Error fetching task:', err);
//                 return;
//             }

//             if (results.length > 0) {
//                 const task = results[0];
//                 const newDate = new Date(task.date);
//                 newDate.setDate(newDate.getDate() + intervalDays);

//                 connection.query(`UPDATE task SET date = ?, status = 'Pending' WHERE taskId = ?`, [newDate.toISOString().slice(0, 10), taskId], (err, result) => {
//                     if (err) {
//                         console.error('Error updating task:', err);
//                     } else {
//                         console.log('Task extended successfully:', result);
//                     }
//                 });
//             }
//         });
//     });
// }


async function AddSubTask(req, resp) {
  const { taskName, category, dueDate, priority, mood } = req.body;
  const { id: userId, taskId } = req.query;

  console.log("adding");
  console.log("dueDate", dueDate);

  const data = {
    taskId: taskId,
    name: taskName,
    date: dueDate,
    mood: mood,
    priority: priority,
    status: 'Pending',
  };

  try {
    // Insert subtask data into the database
    connection.query('INSERT INTO subtasks SET ?', data, (err, res) => {
      if (err) {
        console.error('Error inserting subtask data:', err);
        return resp.status(500).json({ message: 'Failed to insert subtask data' });
      } else {
        console.log('Subtask inserted successfully:', res);
      }
    });

    // Retrieve tokens for the user
    const query = 'SELECT * FROM user_tokens WHERE user_id = ?';
    connection.query(query, [userId], async (err, results) => {
      if (err) {
        console.error('Error retrieving tokens from database:', err);
        return resp.status(500).json({ authenticated: false });
      }

      const tokens = results[0];
      console.log("These are the tokens", tokens);

      if (tokens) {
        oauth2Client.setCredentials(tokens);
        await addTaskToGoogleCalendar(oauth2Client, taskName, dueDate);

        resp.status(200).json({ message: 'SubTask added successfully' });
      } else {
        console.error('No tokens found');
        resp.status(401).json({ message: 'User not authenticated with Google' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    resp.status(500).json({ message: 'Internal server error' });
  }
}




module.exports = {
    AddTask, AddSubTask,checkgoogle
};
