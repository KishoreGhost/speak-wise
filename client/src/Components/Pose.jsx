import React, { useRef, useEffect, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import styled from "styled-components";

// Styled Components for UI enhancements
const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
  justify-content: space-between;
`;

const VideoCanvasContainer = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-right: 20px;

  video,
  canvas {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const ContentContainer = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const FeedbackContainer = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const FeedbackList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const FeedbackItem = styled.li`
  margin-bottom: 8px;
  color: #333;
`;

const StyledButton = styled.button`
  background-color: #007bff;
  color: white;
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 15px;
  width: 100%;
  text-align: center;
  &:hover {
    background-color: #0056b3;
  }
`;

const BodyLanguageFeedbackContainer = styled(FeedbackContainer)``;

const BodyLanguageFeedbackList = styled(FeedbackList)``;

const BodyLanguageFeedbackItem = styled(FeedbackItem)``;

const PostureTester = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [feedback, setFeedback] = useState([]);
  const [bodyLanguageFeedback, setBodyLanguageFeedback] = useState([]);
  const [standingPosture, setStandingPosture] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 640,
    height: 480,
  });
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (!results.poseLandmarks) {
        setFeedback(["Human not detected."]);
        return;
      }

      // Process results.poseLandmarks to provide feedback
      analyzePosture(results.poseLandmarks);
      analyzeBodyLanguage(results.poseLandmarks);

      // Draw landmarks on the canvas
      drawCanvas(results.poseLandmarks);

      // Auto-frame the user's face
      autoFrameFace(results.faceLandmarks);
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: videoDimensions.width,
        height: videoDimensions.height,
      });
      camera.start();
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoDimensions]);

  const toggleDetection = () => {
    setIsDetecting((prevIsDetecting) => !prevIsDetecting);
  };

  const drawCanvas = (landmarks) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    landmarks.forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvasRef.current.width,
        landmark.y * canvasRef.current.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "red";
      ctx.fill();
    });
  };

  const calculateDistance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  };

  const calculateSpineAngle = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return 100;
    }

    const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

    let midHipX, midHipY;
    if (standingPosture) {
      midHipX = (leftHip.x + rightHip.x) / 2;
      midHipY = (leftHip.y + rightHip.y) / 2;
    } else {
      midHipY = videoDimensions.height;
      midHipX = midShoulderX;
    }

    const angle =
      Math.atan2(midHipY - midShoulderY, midHipX - midShoulderX) *
      (180 / Math.PI);
    console.log(landmarks, angle);
    return angle;
  };

  const analyzePosture = (landmarks) => {
    let currentFeedback = [];
    const { width: videoWidth, height: videoHeight } = videoDimensions;

    const shoulderTolerance = videoWidth * 0.035;
    const headPositionTolerance = 0.48;
    const minShoulderWidth = videoWidth * 0.001;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const nose = landmarks[0];

    if (!leftShoulder || !rightShoulder || !nose) {
      setFeedback((prevFeedback) => [...prevFeedback, "Human not detected."]);
      return;
    }

    const shoulderDifference = Math.abs(leftShoulder.y - rightShoulder.y);
    if (shoulderDifference > shoulderTolerance) {
      currentFeedback.push("Keep your shoulders level.");
    }

    const spineAngle = calculateSpineAngle(landmarks);
    if (Math.abs(spineAngle) > 10) {
      currentFeedback.push("Keep your back straight.");
    }

    const averageShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const headPosition = nose.y;

    // Check if the head position is within the correct range
    if (headPosition < 0.35) {
      currentFeedback.push(
        "Head looks like it's too much raised. Keep it down"
      );
    } else if (headPosition > 0.45) {
      currentFeedback.push("Head may be tilted down, keep your head straight.");
    }

    if (standingPosture) {
      const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);

      if (shoulderWidth < minShoulderWidth - 0.04) {
        currentFeedback.push("Open your chest a bit more.");
      }
    }

    setFeedback(currentFeedback);
  };

  const analyzeBodyLanguage = (landmarks) => {
    let newBodyLanguageFeedback = [];

    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (
      leftElbow &&
      leftWrist &&
      leftShoulder &&
      rightElbow &&
      rightWrist &&
      rightShoulder
    ) {
      if (leftWrist.y > leftShoulder.y && rightWrist.y > rightShoulder.y) {
        newBodyLanguageFeedback.push(
          "Avoid keeping your hands hidden or behind your back."
        );
      }

      const handMovementThreshold = 50;
      const leftHandDistance = calculateDistance(leftWrist, leftElbow);
      const rightHandDistance = calculateDistance(rightWrist, rightElbow);

      if (
        leftHandDistance > handMovementThreshold ||
        rightHandDistance > handMovementThreshold
      ) {
        newBodyLanguageFeedback.push("Try to reduce excessive hand movements.");
      }
    }

    const nose = landmarks[0];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (nose && leftHip && rightHip) {
      const midHipX = (leftHip.x + rightHip.x) / 2;
      const midHipY = (leftHip.y + rightHip.y) / 2;

      if (nose.y > midHipY) {
        newBodyLanguageFeedback.push("Avoid leaning too far forward.");
      }
    }

    const headNodThreshold = 20;
    if (nose) {
      const headNodDistance = Math.abs(nose.y - (landmarks[0]?.y || nose.y));
      if (headNodDistance > headNodThreshold) {
        newBodyLanguageFeedback.push("Be mindful of excessive head nodding.");
      }
    }

    setBodyLanguageFeedback(newBodyLanguageFeedback);
  };

  const autoFrameFace = (faceLandmarks) => {
    if (!faceLandmarks || faceLandmarks.length === 0) return;

    const videoElement = videoRef.current;
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    // Assuming faceLandmarks[0] is the nose or a central point of the face
    const faceCenterX = faceLandmarks[0].x * videoWidth;
    const faceCenterY = faceLandmarks[0].y * videoHeight;

    // Calculate the offset needed to center the face
    const offsetX = videoWidth / 2 - faceCenterX;
    const offsetY = videoHeight / 2 - faceCenterY;

    // Adjust the video feed (e.g., by cropping or moving the camera)
    // This is a placeholder for actual implementation
    console.log(`Offset needed: X=${offsetX}, Y=${offsetY}`);
  };

  return (
    <Container>
      <VideoCanvasContainer>
        <video
          ref={videoRef}
          width={videoDimensions.width}
          height={videoDimensions.height}
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          width={videoDimensions.width}
          height={videoDimensions.height}
        />
      </VideoCanvasContainer>

      <ContentContainer>
        <StyledButton onClick={toggleDetection}>
          {isDetecting ? "Stop Detection" : "Start Detection"}
        </StyledButton>

        <StyledButton onClick={() => setStandingPosture((prev) => !prev)}>
          Switch to {standingPosture ? "Sitting" : "Standing"} Posture
        </StyledButton>

        <FeedbackContainer>
          <h2>Posture Feedback</h2>
          <FeedbackList>
            {feedback.map((message, index) => (
              <FeedbackItem key={index}>{message}</FeedbackItem>
            ))}
          </FeedbackList>
        </FeedbackContainer>

        <BodyLanguageFeedbackContainer>
          <h2>Body Language Feedback</h2>
          <BodyLanguageFeedbackList>
            {bodyLanguageFeedback.map((message, index) => (
              <BodyLanguageFeedbackItem key={index}>
                {message}
              </BodyLanguageFeedbackItem>
            ))}
          </BodyLanguageFeedbackList>
        </BodyLanguageFeedbackContainer>
      </ContentContainer>
    </Container>
  );
};

export default PostureTester;
