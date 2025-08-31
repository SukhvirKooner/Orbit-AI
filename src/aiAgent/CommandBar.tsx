import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Send } from 'lucide-react';
import { useNavigator } from './useNavigator';
import { useVoice } from './useVoice';
import { cn } from '@/lib/utils';

interface CommandBarProps {
  className?: string;
  apiEndpoint?: string;
}

export function CommandBar({ className, apiEndpoint = 'http://localhost:9000' }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    lastAction,
    isProcessing,
    error,
    executeCommand,
    resetError,
    clearHistory
  } = useNavigator(apiEndpoint);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    isSupported,
    hasPermission,
    requestPermission,
    error: voiceError
  } = useVoice();

  // Update query when transcript changes
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setQuery(transcript);
    }
  }, [transcript]);

  // Removed automatic speech after task completion
  // AI responses will no longer be spoken automatically

  // Handle sphere click
  const handleSphereClick = async () => {
    if (!isActive) {
      setIsActive(true);
      setShowInput(true);
      
      // Request microphone permission if needed
      if (isSupported.recognition && !hasPermission) {
        await requestPermission();
      }
      
      // Start listening if supported
      if (isSupported.recognition && hasPermission) {
        await startListening();
      }
      
      // Focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (isListening) {
      stopListening();
    }
  };

  // Handle command execution
  const handleExecute = async () => {
    if (!query.trim()) return;
    
    resetError();
    clearHistory(); // Clear history before starting new command
    await executeCommand(query);
    setQuery('');
    setIsActive(false);
    setShowInput(false);
  };

  // Handle input key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to activate
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isActive) {
          handleSphereClick();
        }
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsActive(false);
        setShowInput(false);
        setQuery('');
        if (isListening) {
          stopListening();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isListening, stopListening, isActive]);

  // Determine sphere state
  const getSphereState = () => {
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    if (isActive) return 'active';
    return 'idle';
  };

  const sphereState = getSphereState();

  return (
    <>
      {/* Background overlay */}
      {isActive && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 z-40"
          onClick={() => {
            setIsActive(false);
            setShowInput(false);
            setQuery('');
            if (isListening) stopListening();
          }}
        />
      )}

      {/* Floating sphere container */}
      <div className={cn(
        "fixed z-50 transition-all duration-300 ease-out",
        !isActive && "bottom-6 right-6",
        isActive && "bottom-1/2 right-1/2 transform translate-x-1/2 translate-y-1/2"
      )}>
        {/* Main container */}
        <div className="relative flex flex-col items-center">
        {/* Siri Sphere */}
        <div 
          className={cn(
            "relative cursor-pointer transition-all duration-300 ease-out",
            sphereState === 'idle' && "w-20 h-20",
            sphereState === 'active' && "w-24 h-24",
            sphereState === 'listening' && "w-28 h-28",
            sphereState === 'processing' && "w-24 h-24",
            sphereState === 'speaking' && "w-26 h-26"
          )}
          onClick={handleSphereClick}
        >
          {/* Outer glow */}
          <div 
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-300",
              sphereState === 'idle' && "bg-gradient-to-r from-blue-400/20 to-purple-400/20",
              sphereState === 'active' && "bg-gradient-to-r from-blue-400/30 to-purple-400/30 shadow-lg shadow-blue-400/25",
              sphereState === 'listening' && "bg-gradient-to-r from-green-400/40 to-blue-400/40 shadow-xl shadow-green-400/30 animate-pulse",
              sphereState === 'processing' && "bg-gradient-to-r from-yellow-400/30 to-orange-400/30 shadow-lg shadow-yellow-400/25",
              sphereState === 'speaking' && "bg-gradient-to-r from-purple-400/40 to-pink-400/40 shadow-xl shadow-purple-400/30 animate-pulse"
            )}
          />
          
          {/* Inner sphere */}
          <div 
            className={cn(
              "relative w-full h-full rounded-full transition-all duration-300",
              "bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm",
              "border border-white/30 shadow-inner",
              sphereState === 'listening' && "animate-pulse",
              sphereState === 'processing' && "animate-spin",
              sphereState === 'speaking' && "animate-pulse"
            )}
          >
            {/* Gradient overlay based on state */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-300",
                sphereState === 'idle' && "bg-gradient-to-br from-blue-500/20 to-purple-500/20",
                sphereState === 'active' && "bg-gradient-to-br from-blue-500/30 to-purple-500/30",
                sphereState === 'listening' && "bg-gradient-to-br from-green-500/40 to-blue-500/40",
                sphereState === 'processing' && "bg-gradient-to-br from-yellow-500/30 to-orange-500/30",
                sphereState === 'speaking' && "bg-gradient-to-br from-purple-500/40 to-pink-500/40"
              )}
            />
            
            {/* Inner light */}
            <div 
              className={cn(
                "absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full transition-all duration-300",
                "bg-gradient-to-br from-white/60 to-white/20 blur-sm",
                sphereState === 'listening' && "animate-ping",
                sphereState === 'speaking' && "animate-ping"
              )}
            />
          </div>

          {/* Wave animation for listening/speaking */}
          {(sphereState === 'listening' || sphereState === 'speaking') && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
              <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </div>

        {/* Input Box */}
        {showInput && (
          <div className={cn(
            "w-96 max-w-sm transition-all duration-300",
            isActive && "mt-8"
          )}>
            <div className="relative">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Ask me anything..."}
                className={cn(
                  "w-full h-12 px-4 pr-12 text-base",
                  "bg-white/90 backdrop-blur-sm border-white/30",
                  "rounded-full shadow-lg",
                  "focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50",
                  "transition-all duration-300"
                )}
                disabled={isListening}
              />
              
              {/* Send button */}
              {query.trim() && !isListening && (
                <Button
                  onClick={handleExecute}
                  disabled={isProcessing}
                  className={cn(
                    "absolute right-1 top-1 h-10 w-10 rounded-full",
                    "bg-blue-500 hover:bg-blue-600 text-white",
                    "shadow-lg transition-all duration-200",
                    "flex items-center justify-center"
                  )}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Error display */}
            {(error || voiceError) && (
              <div className="mt-3 text-center">
                <p className="text-sm text-red-500 bg-white/80 rounded-lg px-3 py-2 backdrop-blur-sm">
                  {error || voiceError}
                </p>
              </div>
            )}

            {/* Status text */}
            {isProcessing && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600 bg-white/80 rounded-lg px-3 py-2 backdrop-blur-sm">
                  Processing...
                </p>
              </div>
            )}
          </div>
        )}

        {/* State indicator text */}
        {!showInput && (
          <div className="mt-4 text-center">
            <p className={cn(
              "text-sm font-medium transition-all duration-300",
              sphereState === 'idle' && "text-gray-600",
              sphereState === 'active' && "text-blue-600",
              sphereState === 'listening' && "text-green-600",
              sphereState === 'processing' && "text-yellow-600",
              sphereState === 'speaking' && "text-purple-600"
            )}>
              {sphereState === 'idle' && "Tap to start"}
              {sphereState === 'active' && "Ready to listen"}
              {sphereState === 'listening' && "Listening..."}
              {sphereState === 'processing' && "Processing..."}
              {sphereState === 'speaking' && "Speaking..."}
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Global keyboard shortcut hint */}
      {!isActive && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <p className="text-xs text-gray-500 bg-white/80 rounded-lg px-3 py-1 backdrop-blur-sm">
            Press ⌘K or Ctrl+K to activate
          </p>
        </div>
      )}
    </>
  );
}