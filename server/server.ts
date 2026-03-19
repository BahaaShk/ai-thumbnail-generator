import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import AuthRouter from "./routes/AuthRoutes.js";
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import UserRouter from "./routes/UserRoutes.js";

await connectDB();
const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://bahaashk-thumbnail-ai.vercel.app'
    ],
    credentials: true,
}));

app.set('trust proxy', 1);
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/auth', AuthRouter);
app.use('/api/thumbnail', ThumbnailRouter);
app.use('/api/user', UserRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});