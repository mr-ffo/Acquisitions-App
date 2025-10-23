import express from 'express';
import logger from "#config/logger.js";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "#routes/auth.routes.js";
import dotenv from "dotenv";
import securityMiddleware from "#middleware/security.middleware.js";
dotenv.config();

const app = express();

app.use(helmet())
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("combined" , {stream: {write: (message)=> logger.info(message.trim())}}))
app.use(cookieParser());
app.use(securityMiddleware)


app.get('/', (req, res) => {
 logger.info("hello from acquisition app")
  res.status(200).send('hello from acquitions app');
});

app.get('/health', (req, res) => {
    res.status(200).json({status: "ok" , timestamp: new Date().toISOString(), uptime: process.uptime()});
})

app.get('/api', (req, res) => {
    res.status(200).json({message: "Acquisition API is running!"});
})

app.use('/api/auth' , authRoutes)
export default app;
