import { useCallback } from "react";
import {
  ResultReason,
  SpeechRecognitionResult,
  SpeechSynthesisResult,
} from "microsoft-cognitiveservices-speech-sdk";

import { getTokenOrRefresh } from "../services/api";

export const useSpeech = () => {
  const speechsdk = require("microsoft-cognitiveservices-speech-sdk");

  const setupSpeechRecognition = async () => {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    speechConfig.speechRecognitionLanguage = "en-US";
    speechConfig.speechSynthesisLanguage = "en-US";

    const audioConfigInput = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(
      speechConfig,
      audioConfigInput
    );

    return { recognizer, speechConfig };
  };

  const recognizeSpeech = useCallback(
    async (onRecognized: (text: string) => void) => {
      const { recognizer } = await setupSpeechRecognition();
      return new Promise<void>((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          (result: SpeechRecognitionResult) => {
            if (result.reason === ResultReason.RecognizedSpeech) {
              onRecognized(result.text);
            }
            resolve();
          },
          (error: any) => {
            console.error("Speech recognition error:", error);
            reject(error);
          }
        );
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const synthesizeSpeech = useCallback(
    async (text: string, onSpeakStart: () => void, onSpeakEnd: () => void) => {
      const { speechConfig } = await setupSpeechRecognition();
      const myPlayer = new speechsdk.SpeakerAudioDestination();
      const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(myPlayer);
      const synthesizer = new speechsdk.SpeechSynthesizer(
        speechConfig,
        audioConfig
      );

      myPlayer.onAudioStart = onSpeakStart;
      myPlayer.onAudioEnd = onSpeakEnd;

      return new Promise<void>((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          (result: SpeechSynthesisResult) => {
            if (result.reason === ResultReason.SynthesizingAudioCompleted) {
              resolve();
            } else {
              reject(new Error("Speech synthesis canceled."));
            }
            synthesizer.close();
          },
          (error: any) => {
            console.error("Speech synthesis error:", error);
            synthesizer.close();
            reject(error);
          }
        );
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { recognizeSpeech, synthesizeSpeech };
};
