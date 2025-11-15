import React, { useState, useRef, useEffect } from 'react';
import MicrophoneIcon from './icons/MicrophoneIcon';

// Fix: Add SpeechRecognition types for browsers that support it.
// This avoids TypeScript errors for non-standard browser APIs.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface FormViewProps {
  onSubmit: (userInput: string) => void;
  isLoading: boolean;
  error: string | null;
}

const questions = [
  "What product or service do you offer?",
  "Where is your business based in Canada?",
  "Briefly describe your target industry and customer.",
  "What is your unique value proposition?",
];

const FormView: React.FC<FormViewProps> = ({ onSubmit, isLoading, error }) => {
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [listening, setListening] = useState<number | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullInput = answers.map((answer, index) => `${questions[index]}\n${answer}`).join('\n\n');
    onSubmit(fullInput);
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        setListening(null);
    }
  };

  const handleMicClick = (index: number) => {
    if (listening !== null) {
      stopListening();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-CA';

    recognition.onstart = () => {
      setListening(index);
    };

    recognition.onend = () => {
      stopListening();
    };

    // Fix: Add types for the event object
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      stopListening();
    };

    // Fix: Add types for the event object
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const currentAnswer = answers[index];
      const separator = currentAnswer.endsWith(' ') || currentAnswer === '' ? '' : ' ';
      handleInputChange(index, currentAnswer + separator + transcript);
    };

    recognition.start();
  };
  
  useEffect(() => {
    return () => {
        stopListening();
    }
  }, []);

  const isSubmitDisabled = answers.some(answer => answer.trim() === '') || isLoading;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 sm:text-4xl">Your AI Co-Pilot for Global Growth</h2>
        <p className="mt-4 text-lg text-gray-600">Ready to grow beyond Canada? Describe your business and instantly receive a plan to find new markets, connect with key contacts, and automate your workflow.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
        {questions.map((question, index) => (
          <div key={index}>
            <label htmlFor={`question-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              {question}
            </label>
            <div className="relative">
              <textarea
                id={`question-${index}`}
                rows={3}
                className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 ease-in-out"
                value={answers[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder={`Your answer...`}
                required
              />
              <button
                type="button"
                onClick={() => handleMicClick(index)}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${listening === index ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                aria-label={listening === index ? 'Stop listening' : 'Start listening'}
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Reports...
            </>
          ) : (
            'Generate Reports'
          )}
        </button>
      </form>
    </div>
  );
};

export default FormView;