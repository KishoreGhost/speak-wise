import React, { useRef, useEffect, useState, useCallback } from "react";
import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import styled from "styled-components";
import { useDebounce } from "use-debounce";

// Styled Components for UI enhancements
const Container = styled.div`
  display: flex;
  flex-wrap: wrap; /* Ensures content wraps properly on smaller screens */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
  justify-content: space-between; /* Ensures even spacing */
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
  const [net, setNet] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [bodyLanguageFeedback, setBodyLanguageFeedback] = useState([]);
  const [smoothedKeypoints, setSmoothedKeypoints] = useState({});
  const [standingPosture, setStandingPosture] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 640,
    height: 480,
  });
  const [pose, setPose] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const [debouncedPose] = useDebounce(pose, 500);

  const loadPoseNet = useCallback(async () => {
    tf.setBackend("webgl");
    const loadedNet = await posenet.load();
    setNet(loadedNet);
    return loadedNet;
  }, []);

  const estimatePose = useCallback(async () => {
    if (!net || !videoRef.current || !videoRef.current.videoWidth) {
      return null;
    }
    try {
      const newPose = await net.estimateSinglePose(videoRef.current, {
        flipHorizontal: false,
      });
      return newPose;
    } catch (error) {
      console.error("Error estimating pose:", error);
      return null;
    }
  }, [net]);

  const drawCanvas = useCallback(
    (pose) => {
      if (canvasRef.current && pose) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const keypointsToDraw = standingPosture
          ? pose.keypoints
          : pose.keypoints.filter((kp) =>
              ["nose", "leftShoulder", "rightShoulder"].includes(kp.part)
            );

        keypointsToDraw.forEach((keypoint) => {
          if (keypoint.score > 0.3) {
            const smoothedX =
              (smoothedKeypoints[keypoint.part]?.x || keypoint.position.x) *
                0.85 +
              keypoint.position.x * 0.15;
            const smoothedY =
              (smoothedKeypoints[keypoint.part]?.y || keypoint.position.y) *
                0.85 +
              keypoint.position.y * 0.15;

            ctx.beginPath();
            ctx.arc(smoothedX, smoothedY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();

            setSmoothedKeypoints((prev) => ({
              ...prev,
              [keypoint.part]: { x: smoothedX, y: smoothedY },
            }));
          }
        });
      }
    },
    [smoothedKeypoints, standingPosture]
  );

  const calculateDistance = useCallback((point1, point2) => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }, []);

  const analyzePosture = useCallback(
    (keypoints) => {
      let currentFeedback = [];
      const { width: videoWidth, height: videoHeight } = videoDimensions;

      const shoulderTolerance = videoWidth * 0.035;
      const headPositionTolerance = videoHeight * 0.08;
      const minShoulderWidth = videoWidth * 0.18;

      if (
        !keypoints["leftShoulder"] ||
        !keypoints["rightShoulder"] ||
        !keypoints["nose"]
      ) {
        return; // Exit if keypoints are missing
      }

      const shoulderDifference = Math.abs(
        keypoints["leftShoulder"].y - keypoints["rightShoulder"].y
      );
      if (shoulderDifference > shoulderTolerance) {
        currentFeedback.push("Keep your shoulders level.");
      }

      const spineAngle = calculateSpineAngle(keypoints);
      if (Math.abs(spineAngle) > 10) {
        currentFeedback.push("Keep your back straight.");
      }

      const headIsAboveShoulders =
        keypoints["nose"].y <
        keypoints["leftShoulder"].y + headPositionTolerance;
      const headIsBelowShoulders =
        keypoints["nose"].y >
        keypoints["leftShoulder"].y - headPositionTolerance;

      if (headIsAboveShoulders) {
        currentFeedback.push("Keep your head up.");
      } else if (headIsBelowShoulders) {
        currentFeedback.push(
          "Head may be tilted down, keep your head straight."
        );
      }

      if (standingPosture) {
        const shoulderWidth = calculateDistance(
          keypoints["leftShoulder"],
          keypoints["rightShoulder"]
        );

        if (shoulderWidth < minShoulderWidth) {
          currentFeedback.push("Open your chest a bit more.");
        }
      }

      setFeedback(currentFeedback);
    },
    [videoDimensions, standingPosture]
  );

  const analyzeBodyLanguage = useCallback(
    (currentPose) => {
      if (!currentPose) return;

      let newBodyLanguageFeedback = [];

      const leftElbow = currentPose.keypoints.find(
        (kp) => kp.part === "leftElbow"
      );
      const rightElbow = currentPose.keypoints.find(
        (kp) => kp.part === "rightElbow"
      );
      const leftWrist = currentPose.keypoints.find(
        (kp) => kp.part === "leftWrist"
      );
      const rightWrist = currentPose.keypoints.find(
        (kp) => kp.part === "rightWrist"
      );
      const leftShoulder = currentPose.keypoints.find(
        (kp) => kp.part === "leftShoulder"
      );
      const rightShoulder = currentPose.keypoints.find(
        (kp) => kp.part === "rightShoulder"
      );

      if (
        leftElbow &&
        leftWrist &&
        leftShoulder &&
        rightElbow &&
        rightWrist &&
        rightShoulder
      ) {
        if (
          leftWrist.position.y > leftShoulder.position.y &&
          rightWrist.position.y > rightShoulder.position.y
        ) {
          newBodyLanguageFeedback.push(
            "Avoid keeping your hands hidden or behind your back."
          );
        }

        const handMovementThreshold = 50;
        const leftHandDistance = calculateDistance(
          leftWrist.position,
          smoothedKeypoints["leftWrist"] || leftWrist.position
        );
        const rightHandDistance = calculateDistance(
          rightWrist.position,
          smoothedKeypoints["rightWrist"] || rightWrist.position
        );

        if (
          leftHandDistance > handMovementThreshold ||
          rightHandDistance > handMovementThreshold
        ) {
          newBodyLanguageFeedback.push(
            "Try to reduce excessive hand movements."
          );
        }
      }

      const nose = currentPose.keypoints.find((kp) => kp.part === "nose");
      const leftHip = currentPose.keypoints.find((kp) => kp.part === "leftHip");
      const rightHip = currentPose.keypoints.find(
        (kp) => kp.part === "rightHip"
      );

      if (nose && leftHip && rightHip) {
        const midHipX = (leftHip.position.x + rightHip.position.x) / 2;
        const midHipY = (leftHip.position.y + rightHip.position.y) / 2;

        if (nose.position.y > midHipY) {
          newBodyLanguageFeedback.push("Avoid leaning too far forward.");
        }
      }

      const headNodThreshold = 20;
      if (nose && smoothedKeypoints["nose"]) {
        const headNodDistance = Math.abs(
          nose.position.y - (smoothedKeypoints["nose"]?.y || nose.position.y)
        );
        if (headNodDistance > headNodThreshold) {
          newBodyLanguageFeedback.push("Be mindful of excessive head nodding.");
        }
      }

      setBodyLanguageFeedback(newBodyLanguageFeedback);
    },
    [smoothedKeypoints, calculateDistance]
  );

  const calculateSpineAngle = useCallback((keypoints) => {
    const leftShoulder = keypoints["leftShoulder"];
    const rightShoulder = keypoints["rightShoulder"];
    const leftHip = keypoints["leftHip"];
    const rightHip = keypoints["rightHip"];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return 0; // Or handle the missing keypoints appropriately
    }

    const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

    const midHipX = (leftHip.x + rightHip.x) / 2;
    const midHipY = (leftHip.y + rightHip.y) / 2;

    const angle =
      Math.atan2(midHipY - midShoulderY, midHipX - midShoulderX) *
      (180 / Math.PI);
    return angle;
  }, []);

  const detectPose = useCallback(async () => {
    if (!isDetecting) return;
    try {
      const newPose = await estimatePose();
      if (newPose) {
        setPose(newPose);
        drawCanvas(newPose);
        const keypoints = newPose.keypoints.reduce((acc, kp) => {
          acc[kp.part] = kp.position;
          return acc;
        }, {});
        analyzePosture(keypoints);
      }
    } catch (error) {
      console.error("Error in detection loop:", error);
    } finally {
      requestAnimationFrame(detectPose);
    }
  }, [estimatePose, drawCanvas, analyzePosture, isDetecting]);

  const toggleDetection = useCallback(() => {
    setIsDetecting((prev) => !prev);
  }, []);

  useEffect(() => {
    let stream;

    const runPoseEstimation = async () => {
      const loadedNet = await loadPoseNet();
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              setVideoDimensions({
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight,
              });
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            };
          }
        } catch (err) {
          console.error("Error accessing webcam:", err);
        }
      }
    };

    runPoseEstimation();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsDetecting(false);
    };
  }, [loadPoseNet]);

  useEffect(() => {
    if (isDetecting) {
      detectPose();
    }
  }, [isDetecting, detectPose]);

  useEffect(() => {
    analyzeBodyLanguage(debouncedPose);
  }, [debouncedPose, analyzeBodyLanguage]);

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
