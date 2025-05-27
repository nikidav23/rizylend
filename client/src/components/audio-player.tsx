import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import type { AudioBook } from "@shared/schema";

interface AudioPlayerProps {
  audioBook: AudioBook;
  onProgressUpdate?: (progress: number) => void;
}

export default function AudioPlayer({ audioBook, onProgressUpdate }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioBook.duration || 0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    if (onProgressUpdate && duration > 0) {
      const progress = Math.round((currentTime / duration) * 100);
      onProgressUpdate(progress);
    }
  }, [currentTime, duration, onProgressUpdate]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(audio.currentTime + 15, duration);
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(audio.currentTime - 15, 0);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <audio ref={audioRef} src={audioBook.audioUrl} />
        
        {/* Book Info */}
        <div className="flex items-center mb-6">
          <img
            src={audioBook.coverImage || `https://via.placeholder.com/80x80/84CC16/ffffff?text=${encodeURIComponent(audioBook.title)}`}
            alt={audioBook.title}
            className="w-16 h-16 rounded-lg object-cover mr-4"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg line-clamp-2">{audioBook.title}</h3>
            <p className="text-gray-600">{audioBook.author}</p>
            {audioBook.narrator && (
              <p className="text-sm text-gray-500">Читает: {audioBook.narrator}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBackward}
            className="h-12 w-12"
          >
            <SkipBack size={20} />
          </Button>
          
          <Button
            onClick={togglePlayPause}
            size="lg"
            className="h-16 w-16 rounded-full bg-[hsl(var(--rizy-blue))] hover:bg-[hsl(var(--rizy-blue))]/90"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            className="h-12 w-12"
          >
            <SkipForward size={20} />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Volume2 size={16} className="text-gray-500" />
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
