import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());
const transporter = nodemailer.createTransport({
// Configure your email transporter here
});
app.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;
    try {
        await transporter.sendMail({
            from: '"Your App" <noreply@yourapp.com>',
            to,
            subject,
            text,
        });
        res.status(200).send('Email sent successfully');
    }
    catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('send-notification', (data) => {
        // Broadcast the notification to all connected clients
        io.emit('new-notification', data);
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Notifications microservice listening on port ${PORT}`);
});
