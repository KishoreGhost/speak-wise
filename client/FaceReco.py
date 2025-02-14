import cv2
from deepface import DeepFace
import time
import os
import google.generativeai as genai

# Initialize Gemini API
genai.configure(api_key="AIzaSyCcqw0lMr5yEMHv_O0NIGd0Ytj3h9JLTZo")

def analyze_facial_expression(video_path, analysis_interval=2):
    """Analyzes facial expressions in a video and provides Gemini-powered feedback."""
    try:
        # Debug: Check if the file exists
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found at {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")

        frame_rate = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        processed_frames = 0
        emotion_counts = {}
        last_analysis_time = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            processed_frames += 1
            current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0

            if current_time - last_analysis_time >= analysis_interval:
                try:
                    analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                    if analysis and len(analysis) > 0:
                        emotions = analysis[0]['emotion']
                        dominant_emotion = max(emotions, key=emotions.get)
                        emotion_counts[dominant_emotion] = emotion_counts.get(dominant_emotion, 0) + 1
                        last_analysis_time = current_time

                        cv2.putText(frame, dominant_emotion, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                        cv2.imshow('Video Analysis', frame)
                        if cv2.waitKey(1) & 0xFF == ord('q'):
                            break

                except Exception as e:
                    print(f"DeepFace Analysis Error: {e}")
                    continue

            if processed_frames % int(frame_rate) == 0:
                progress = (processed_frames / total_frames) * 100
                print(f"Processing: {progress:.1f}%  Dominant emotions: {emotion_counts}")

        cap.release()
        cv2.destroyAllWindows()

        feedback = generate_gemini_feedback(emotion_counts)
        return feedback

    except Exception as e:
        return f"Error: {e}"


def generate_gemini_feedback(emotion_counts):
    """Generates feedback using the Gemini API."""
    if not emotion_counts:
        return "No face detected in the video."

    dominant_emotions = sorted(emotion_counts, key=emotion_counts.get, reverse=True)
    dominant_emotion = dominant_emotions[0]

    prompt = f"""
    Analyze the following facial expression data and provide constructive feedback for someone who just recorded a video:

    Dominant Emotion: {dominant_emotion}
    Emotion Counts: {emotion_counts}

    Consider factors like:
    * How the dominant emotion might be perceived by viewers.
    * Suggestions for improving communication and engagement.
    * How to project confidence and enthusiasm (if needed).
    * Specific examples of what they could do differently.

    Keep the feedback concise and actionable (around 50-75 words).
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating Gemini feedback: {e}"


# Example usage
recorded_video_path = "./testvid2.mov"  # Replace with the actual path
if os.path.exists(recorded_video_path):
    feedback = analyze_facial_expression(recorded_video_path)
    print("\nFeedback:")
    print(feedback)
else:
    print(f"Error: Video file not found at {recorded_video_path}")