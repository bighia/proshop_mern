import path from "path";
import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import morgan from "morgan";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import https from "https";
// import readline from "readline";

dotenv.config();

connectDB().then();

const app = express();

let options;

if (process.env.NODE_ENV !== "production") {
    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    // });
    // rl.question(
    //     "Please input the passphrase for private key: ",
    //     (passphrase) => {
    options = {
        key: fs.readFileSync("backend/key.pem", "utf-8"),
        cert: fs.readFileSync("backend/cert.pem", "utf8"),
        passphrase: "TesterSGB@t3sting",
    };
    // }
    // );
    app.use(helmet());
    // app.use((req, res, next) => {
    //     if (req.header("x-forwarded-proto") !== "https") {
    //         return res.redirect(`https://${req.header("host")}${req.url}`);
    //         // } else {
    //     }
    //     next();
    // });
    app.use(
        cors({
            origin: "https://127.0.0.1:5000", //Chan tat ca cac domain khac ngoai domain nay
            credentials: true, //Để bật cookie HTTP qua CORS
        })
    );
} else if (process.env.NODE_ENV === "production") {
    app.use(
        helmet({
            hsts: {
                maxAge: 63072000,
                preload: true,
            },
        })
    );
    // Sets "Strict-Transport-Security: max-age=123456; includeSubDomains; preload"
    // app.use(
    //     helmet.hsts({
    //         maxAge: 63072000,
    //         preload: true,
    //     })
    // );
    // app.use((req, res, next) => {
    //     res.set(
    //         "Strict-Transport-Security",
    //         "max-age=31536000; includeSubDomains"
    //     );
    //     next();
    // });

    app.use((req, res, next) => {
        if (req.header("x-forwarded-proto") !== "https") {
            res.redirect(`https://${req.header("host")}${req.url}`);
        } else {
            next();
        }
    });

    app.use(
        cors({
            origin: "https://minhman.xyz", //Chan tat ca cac domain khac ngoai domain nay
            // origin: "http://127.0.0.1:5000", //Chan tat ca cac domain khac ngoai domain nay
            credentials: true, //Để bật cookie HTTP qua CORS
        })
    );
}

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// app.use(express.json()); // for parsing application/json
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); //cookie-parser dùng để đọc cookies của request

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/config/paypal", (req, res) =>
    res.send(process.env.PAYPAL_CLIENT_ID)
);

app.get("/api/config", (req, res) =>
    res.send({
        url:
            process.env.NODE_ENV === "production"
                ? process.env.PUBLIC_URL
                : process.env.NODE_ENV === "testing"
                ? process.env.TEST_URL
                : process.env.DEV_URL,
        maxFileSize: process.env.MAX_FILE_SIZE,
        base64MaxFileSize: process.env.BASE64_MAX_FILE_SIZE,
        virusTotalURL: process.env.VIRUST_URL,
        virusTotalAPIKey: process.env.X_APIKEY,
    })
);

const __dirname = path.resolve();
// if (process.env.NODE_ENV !== "production") {
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
console.log("DIRNAME: " + __dirname);
// }

if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "testing"
) {
    app.use(express.static(path.join(__dirname, "/frontend/build")));

    app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
    );
} else {
    app.get("/", (req, res) => {
        res.send("API is running...");
    });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV === "testing") {
    https.createServer(options, app).listen(PORT, () => {
        console.log(
            colors.yellow.bold(
                `Server running in ${process.env.NODE_ENV} mode on port ${PORT} using self-serve SSL Cert.`
                // + "at 2023-03-06, 18:29:30"
            )
        );
    });
} else {
    app.listen(PORT, () => {
        console.log(
            colors.yellow.bold(
                `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
                // + "at 2023-03-06, 18:29:30"
            )
        );
    });
}
