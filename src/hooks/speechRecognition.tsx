import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export const useSpeechRecognition = (onRecordingComplete?: (text: string) => void) => {
  const [spokenText, setSpokenText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  // Using ref to ensure the listener accesses the most recent value
  const isRecordingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(granted);
    })();
  }, []);

  // Handle recognition results
  useSpeechRecognitionEvent("result", (event) => {
    if (!isRecordingRef.current) return;

    if (event.results?.length) {
      setSpokenText(event.results[0].transcript);
    }
  });

  // Handle end of recording
  useSpeechRecognitionEvent("end", () => {
    if (!isRecordingRef.current) return;

    setIsRecording(false);
    isRecordingRef.current = false;
    
    if (onRecordingComplete && spokenText) {
      onRecordingComplete(spokenText);
    }
  });

  // Handle errors during recording
  useSpeechRecognitionEvent("error", (event) => {
    if (!isRecordingRef.current) return;
    
    setIsRecording(false);
    isRecordingRef.current = false;
    Alert.alert("Speech Recognition Error", event.message);
  });

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert("Permission", "Microphone access is required.");
      return;
    }

    setSpokenText(""); 
    setIsRecording(true);
    isRecordingRef.current = true;

    try {
      await ExpoSpeechRecognitionModule.start({
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    spokenText,
    setSpokenText,
    isRecording,
    hasPermission,
    startRecording,
    stopRecording,
  };
};