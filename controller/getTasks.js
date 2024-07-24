const { connection } = require('../utils/connection');
const PDFDocument = require('pdfkit');
const cron = require('node-cron');

const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const path = require('path');
const fs = require('fs');


const nodemailer=require('nodemailer')

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});


cron.schedule('0 0 * * *', () => {
    console.log('Running daily check...');

    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);

    // Query to select tasks with due date within the next 5 days
    const query = `
        SELECT task.name, task.date, users.email
        FROM task
        JOIN users ON task.userid = users.userid
        WHERE task.date <= ?
        AND task.date >= ?
        AND task.status != 'Completed'
    `;

    connection.query(query, [fiveDaysFromNow, today], (error, results) => {
        if (error) {
            console.error('Error querying tasks:', error);
            return;
        }

        results.forEach(task => {
            const mailOptions = {
                from: 'faizanazam6980@gmail.com',
                to: task.email, // Email from users table
                subject: 'Reminder: Upcoming Task Due',
                html: `
                    <h1>Hello,</h1>
                    <p>This is a reminder that your task "${task.name}" is due on ${task.date}.</p>
                    <p>Please make sure to complete it before the due date.</p>
                    <p>Best regards,<br>Your Task Manager</p>
                `,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        });
    });
});

async function GetTasks(req, resp) {
    const {id} = req.query;

    console.log("Tis is Id",id)
    connection.query(`SELECT t.*
    FROM task t
    LEFT JOIN task_invitations ti ON t.taskId = ti.taskId
    WHERE (ti.recieverId = ? AND ti.status = 'accepted') OR t.userid = ?
    ORDER BY t.order`,[id,id],(err,res)=>{
        if(err) throw err;
        else{
            resp.status(200).json({ data:res });
        }
    })
}


async function getsubtasks(req, resp) {
    const {taskId} = req.query;

    connection.query(`  SELECT t.*
    FROM subtasks t
    WHERE t.taskId = ?`,[taskId],(err,res)=>{
        if(err) throw err;
        else{
            resp.status(200).json({ data:res });
        }
    })
}







pdfMake.vfs = pdfFonts.pdfMake.vfs;

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function generateReport(data, reportType) {
    const docDefinition = {
        content: [
            { text: `${reportType} Report`, fontSize: 24, alignment: 'center', margin: [0, 0, 0, 20] },
            { text: `Report Date: ${formatDate(new Date())}`, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 20] },
            {
                table: {
                    headerRows: 1,
                    widths: [80, 150, 100, 100],
                    body: [
                        [{ text: 'Task ID', bold: true }, { text: 'Name', bold: true }, { text: 'Date', bold: true }, { text: 'Status', bold: true }],
                        ...data.map(item => [
                            item.taskId.toString(),
                            item.name,
                            formatDate(item.date),
                            item.status
                        ])
                    ]
                },
                layout: 'lightHorizontalLines'
            },
            { text: 'Generated by EmotiTask System', fontSize: 10, alignment: 'center', margin: [0, 20, 0, 0] }
        ]
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    const fileName = `${reportType.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = path.join(__dirname, fileName);

    return new Promise((resolve, reject) => {
        pdfDoc.getBuffer((buffer) => {
            fs.writeFile(filePath, buffer, (err) => {
                if (err) reject(err);
                else resolve(filePath);
            });
        });
    });
}










async function getWeeklyTasks(req, resp) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    connection.query(
        `SELECT * FROM task WHERE date BETWEEN ? AND ? ORDER BY date ASC`,
        [startOfWeek.toISOString().slice(0, 19).replace('T', ' '), endOfWeek.toISOString().slice(0, 19).replace('T', ' ')],
        async (err, res) => {
            if (err) throw err;

            try {
                const filePath = await generateReport(res, 'Weekly');
                resp.download(filePath, (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                        resp.status(500).json({ message: 'Error downloading report' });
                    }
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            } catch (error) {
                console.error('Error generating report:', error);
                resp.status(500).json({ message: 'Error generating report' });
            }
        }
    );
}

async function getMonthlyTasks(req, resp) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of the month

    connection.query(
        `SELECT * FROM task WHERE date BETWEEN ? AND ? ORDER BY date ASC`,
        [startOfMonth.toISOString().slice(0, 19).replace('T', ' '), endOfMonth.toISOString().slice(0, 19).replace('T', ' ')],
        async (err, res) => {
            if (err) throw err;

            try {
                const filePath = await generateReport(res, 'Monthly');
                resp.download(filePath, (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                        resp.status(500).json({ message: 'Error downloading report' });
                    }
                    // Clean up the file after sending
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            } catch (error) {
                console.error('Error generating report:', error);
                resp.status(500).json({ message: 'Error generating report' });
            }
        }
    );
}



module.exports = {
    GetTasks,getWeeklyTasks,getMonthlyTasks,getsubtasks
};