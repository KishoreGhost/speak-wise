import cv2
from deepface import DeepFace
import os
import google.generativeai as genai

# Initialize Gemini API
genai.configure(api_key="AIzaSyCcqw0lMr5yEMHv_O0NIGd0Ytj3h9JLTZo")

def analyze_facial_expression(video_path, analysis_interval=2):
    """Analyzes facial expressions in a video and provides Gemini-powered feedback."""
    try:
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found at {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")

        emotion_counts = {}
        last_analysis_time = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

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
                        cv2.imshow('Analysis', frame)
                        if cv2.waitKey(1) & 0xFF == ord('q'):
                            break
                except Exception as e:
                    print(f"DeepFace error: {e}")

        cap.release()
        cv2.destroyAllWindows()

        # Get separate feedbacks
        face_feedback, face_score = generate_face_feedback(emotion_counts)
        body_feedback, body_score = generate_body_language_feedback()  # Now returns both values
        
        return face_feedback, face_score, body_feedback, body_score

    except Exception as e:
        return f"Error: {e}", 0, "No feedback available", 0

def generate_face_feedback(emotion_counts):
    """Generates facial expression feedback with score"""
    if not emotion_counts:
        return "No face detected", 0

    dominant_emotion = max(emotion_counts, key=emotion_counts.get)
    
    prompt = f"""Analyze these facial expression counts: {emotion_counts}
    Generate JSON-formatted feedback with:
    1. A score (0-100) based on emotional expressiveness and appropriateness
    2. Concise feedback on improving facial expressions
    3. Most common emotion: {dominant_emotion}
    
    Use this structure:
    {{
        "score": 75,
        "feedback": "Your frequent neutral expressions...",
        "dominant_emotion": "neutral"
    }}"""
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return parse_response(response.text, 'face')
    except Exception as e:
        return f"Face analysis error: {e}", 0

def generate_body_language_feedback():
    """Generates body language feedback with score"""
    prompt = """Provide general body language feedback for video presentations.
    Include 3-5 concise tips about posture, gestures, and eye contact.
    Format as: 
    {
        "feedback": "1. Maintain upright posture...",
        "score": 70
    }"""
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return parse_response(response.text, 'body')
    except Exception as e:
        return f"Body analysis error: {e}", 0  # Return score 0 on error

def parse_response(text, feedback_type):
    """Extracts structured data from Gemini response"""
    try:
        if feedback_type == 'face':
            return (
                text.split('"feedback": "')[1].split('"')[0],
                int(text.split('"score": ')[1].split(',')[0]),
            )
        elif feedback_type == 'body':
            return (
                text.split('"feedback": "')[1].split('"')[0],
                int(text.split('"score": ')[1].split('}')[0]))
    except:
        return "Could not parse feedback", 0

def generate_brief_feedback(face_score, face_feedback, body_score, body_feedback):
    """Generates a consolidated brief feedback summary"""
    prompt = f"""Create a concise overall performance summary (50-75 words) using these metrics:
    
    Facial Analysis:
    - Score: {face_score}/100
    - Feedback: {face_feedback}
    
    Body Language:
    - Score: {body_score}/100
    - Feedback: {body_feedback}
    
    Provide a brief, encouraging summary that:
    1. Highlights strengths and areas for improvement
    2. Mentions both facial and body language aspects
    3. Gives an overall performance score
    4. Maintains a positive, constructive tone
    """
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Could not generate summary: {e}"

# Usage
video_path = "./testvid2.mov"
if os.path.exists(video_path):
    face_fb, face_score, body_fb, body_score = analyze_facial_expression(video_path)
    brief_feedback = generate_brief_feedback(face_score, face_fb, body_score, body_fb)
    
    print(f"\nFacial Score: {face_score}/100")
    print(f"Facial Feedback: {face_fb}")
    print(f"\nBody Language Score: {body_score}/100")
    print(f"Body Feedback: {body_fb}")
    print("\n=== Overall Performance Summary ===")
    print(brief_feedback)
else:
    print("File not found")