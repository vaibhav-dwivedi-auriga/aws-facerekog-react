require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Configure AWS SDK with direct credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

// Initialize Rekognition
const rekognition = new AWS.Rekognition();

// Route to create a liveness session
app.get("/api/create-liveness-session", async (req, res) => {
  try {
    const params = {
      ClientRequestToken: `liveness-${Date.now()}`,
    };

    const data = await rekognition.createFaceLivenessSession(params).promise();
    res.json({ data, sessionId: data.SessionId });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get liveness session results
app.get("/api/get-liveness-results", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const params = {
      SessionId: sessionId,
    };

    const data = await rekognition.getFaceLivenessSessionResults(params).promise();
    res.json({ data, isLive: data.Confidence > 90 });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: error.message });
  }
});

// for angular

app.post("/api/get-liveness-results", async (req, res) => {
    try {
        const { sessionId, image } = req.body;
    
        if (!sessionId || !image) {
          return res.status(400).json({ error: "Session ID and Image are required" });
        }
    
        // Convert Base64 image to Buffer
        const imageBuffer = Buffer.from(image, "base64");
    
        // const params = {
        //   SessionId: sessionId,
        //   Image: {
        //     Bytes: imageBuffer,
        //   },
        // };
        const params = {
            Image: { Bytes: imageBuffer },
            Attributes: ["ALL"],
          };
    
        const data = await rekognition.detectFaces(params).promise();

        if (data.FaceDetails.length === 0) {
        return res.json({ isLive: false, message: "No face detected" });
        }

        const face = data.FaceDetails[0];

        // Checking if the face appears live
        const isLive =
        face.Confidence > 90 &&
        face.EyesOpen?.Value &&
        face.MouthOpen?.Confidence > 90;

        res.    json({ isLive, faceAttributes: face });
        // res.json({ data, isLive: data.Confidence > 90 });
      } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ error: error.message });
      }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
