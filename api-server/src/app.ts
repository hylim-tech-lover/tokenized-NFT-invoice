// Imports
// ========================================================
import cors from "cors";
import httpStatus from "http-status";
import multer from "multer";
import multerS3 from "multer-s3";
import fse from "fs-extra";
import express, { json, urlencoded } from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
import { resolve } from "path";

import morganMiddleware from "./config/morgan";
import Logger from "./config/logger";

export const port = 3000;

// ENV VARS
// ========================================================
config({ path: resolve(__dirname, "../.env") });

const NODE_ENV: string = process.env.NODE_ENV || "development";
const FILE_DEST: string = process.env.FILE_DEST || `${__dirname}/../artifacts`;
const FILE_SERVER_URL: string =
  process.env.FILE_SERVER_URL || `http://localhost:${port}`;
const FILEBASE_BUCKET = process.env.FILEBASE_BUCKET || "";

// Logger.info(FILE_SERVER_URL);
// Logger.info(FILE_DEST);
// Logger.info(NODE_ENV);

// Configured AWS S3 Client For Filebase
const s3Client = new S3Client({
  endpoint: process.env.FILEBASE_S3_BASE_URI || "https://s3.filebase.com",
  region: process.env.FILEBASE_REGION || "",
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY || "",
    secretAccessKey: process.env.FILEBASE_SECRET_KEY || "",
  },
});

if (NODE_ENV === "development") {
  fse.ensureDir(FILE_DEST);
}
/**
 * Main uploader middleware that configures the final `destination` of the file and how the `filename` would be set once saved
 */

const upload =
  // If production use the s3 client
  NODE_ENV === "production"
    ? multer({
        storage: multerS3({
          s3: s3Client,
          bucket: FILEBASE_BUCKET,
          metadata: (_req, file, callback) => {
            callback(null, { fieldName: file.fieldname });
          },
          key: (_req, file, callback) => {
            callback(null, file.originalname);
          },
        }),
      })
    : // If development use local file
      multer({
        storage: multer.diskStorage({
          destination: (_req, file, callback) => {
            callback(null, FILE_DEST); // Only upload to FILE_DEST if success
          },
          filename: (_req, file, callback) => {
            callback(null, file.originalname); // Only use file name if success
          },
        }),
      });

/**
 * Initial ExpressJS
 */
const app = express();

// Middlewares
// ========================================================
app.use(json());

// Replace default logging for middleware
app.use(morganMiddleware);

app.use(
  urlencoded({
    extended: true,
  })
);

// enable all CORS request
/**
 * Allows for requests from other servers
 */
app.use(cors());

// Endpoints / Routes
// ========================================================
/**
 * Main endpoint to verify that things are working and what environment mode it's running in
 */
app.get("/nodeEnv", (_req, res) => res.json({ environment: NODE_ENV }));

// POST API to upload file
app.post("/upload", upload.single("file"), async (req, res, next) => {
  if (req.file) {
    const resData = {
      file: req.file?.originalname,
      url: `${FILE_SERVER_URL}/${req.file?.originalname}`,
    };
    // If production retrieve file data to get the ipfs CID
    if (NODE_ENV === "production") {
      try {
        const commandGetObject = new GetObjectCommand({
          Bucket: FILEBASE_BUCKET,
          Key: req.file?.originalname,
        });
        const res = await s3Client.send(commandGetObject);
        // Replace url parameter
        resData.url = `ipfs://${res.Metadata?.cid}`;
      } catch (err: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          message: err.message,
        });
        next(err);
      }
    }
    return res.json({ data: resData });
  } else {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: `No file detected` });
  }
});

// send back a 404 error for any unknown api request
app.use((req, res) => {
  res
    .status(httpStatus.NOT_FOUND)
    .json({ message: `url path : ${req.path} does not exist` });
});

export default app;
