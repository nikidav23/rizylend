import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, Headphones, X } from "lucide-react";
import { initTelegramApp, hapticFeedback } from "@/lib/telegram";
import { useQuery } from "@tanstack/react-query";
import type { AudioBook } from "@shared/schema";

export default function Audio() {
  // Загружаем аудиокниги из API
  const { data: audioBooks = [], isLoading } = useQuery<AudioBook[]>({
    queryKey: ["/api/audio-books"],
  });

  const [currentAudioBookIndex, setCurrentAudioBookIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [demoTimeLeft, setDemoTimeLeft] = useState(60); // 60 секунд для демо
  const audioRef = useRef<HTMLAudioElement>(null);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Текущая аудиокнига
  const currentAudioBook = audioBooks[currentAudioBookIndex];

  useEffect(() => {
    initTelegramApp();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      
      // Обновляем демо-таймер при изменении времени аудио
      if (isDemoMode) {
        const audioTime = Math.floor(audio.currentTime);
        const remaining = Math.max(0, 60 - audioTime);
        setDemoTimeLeft(remaining);
        
        if (audioTime >= 60) {
          audio.pause();
          setIsPlaying(false);
          setIsDemoMode(false);
          setShowPurchaseModal(true); // Показываем окно покупки
          hapticFeedback.warning();
        }
      }
    };
    
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isDemoMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const startDemoTimer = () => {
    // Этот метод больше не нужен, логика перенесена в updateTime
  };

  const handlePlayClick = () => {
    hapticFeedback.light();
    const audio = audioRef.current;
    if (!audio) return;

    // Проверяем, можно ли воспроизводить
    if (!isPurchased && !isDemoMode) {
      // Если не куплено и не в режиме демо - показываем модальное окно
      setShowDemoModal(true);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (isDemoMode && demoTimerRef.current) {
        clearInterval(demoTimerRef.current);
      }
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleBuyClick = () => {
    hapticFeedback.light();
    setShowPurchaseModal(true);
  };

  const handleDemoClick = () => {
    hapticFeedback.light();
    setShowDemoModal(true);
  };

  const startDemo = () => {
    setIsDemoMode(true);
    setDemoTimeLeft(60);
    setShowDemoModal(false);
    // Автоматически начинаем воспроизведение
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0; // Начинаем с начала
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSkipBack = () => {
    hapticFeedback.light();
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(0, audio.currentTime - 10);
      audio.currentTime = newTime;
    }
  };

  const handleSkipForward = () => {
    hapticFeedback.light();
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.min(audio.duration, audio.currentTime + 10);
      audio.currentTime = newTime;
    }
  };

  const handleSpeedChange = () => {
    hapticFeedback.selection();
    setPlaybackSpeed(currentSpeed => {
      if (currentSpeed === 1) return 1.5;
      if (currentSpeed === 1.5) return 2;
      return 1; // Reset to 1 from 2
    });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSpeedDisplay = () => {
    if (playbackSpeed === 1.5) return "1.5x";
    if (playbackSpeed === 2) return "2x";
    return "1x";
  };

  return (
    <div className="max-w-md mx-auto bg-gray-100 h-screen relative overflow-hidden flex flex-col">
      {/* Header */}
      <header className="relative z-10 p-4 bg-white flex-shrink-0">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => hapticFeedback.light()}
            className="text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
      </header>

      {/* Audio Player Content */}
<div className="relative z-10 flex-1 flex flex-col bg-white justify-center px-6 py-4" style={{ transform: 'translateY(-5%)' }}>
        
        {/* Navigation indicators for multiple audiobooks */}
        {audioBooks.length > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (currentAudioBookIndex > 0) {
                  setCurrentAudioBookIndex(currentAudioBookIndex - 1);
                  hapticFeedback.light();
                }
              }}
              disabled={currentAudioBookIndex === 0}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex space-x-1">
              {audioBooks.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentAudioBookIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (currentAudioBookIndex < audioBooks.length - 1) {
                  setCurrentAudioBookIndex(currentAudioBookIndex + 1);
                  hapticFeedback.light();
                }
              }}
              disabled={currentAudioBookIndex === audioBooks.length - 1}
              className="text-gray-400 hover:text-gray-600"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Загрузка аудиокниг...</p>
          </div>
        )}

        {/* No audiobooks state */}
        {!isLoading && audioBooks.length === 0 && (
          <div className="text-center mb-4">
            <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Нет аудиокниг</h2>
            <p className="text-gray-600">Аудиокниги пока не добавлены</p>
          </div>
        )}

        {/* Title and Author */}
        {currentAudioBook && (
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {currentAudioBook.title}
            </h2>
            <p className="text-gray-600">
              {currentAudioBook.author}
            </p>
            {currentAudioBook.narrator && (
              <p className="text-sm text-gray-500">Читает: {currentAudioBook.narrator}</p>
            )}
          </div>
        )}
        
        {/* Book Cover and Actions - only show if audiobook exists */}
        {currentAudioBook && (
          <>
            {/* Book Cover */}
            <div className="w-40 h-40 rounded-xl overflow-hidden mb-4 mx-auto">
              <img 
                src={currentAudioBook.coverImage || "/avtomobil-cover.webp"} 
                alt={`${currentAudioBook.title} - ${currentAudioBook.author}`} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 mb-4">
              <Button 
                onClick={handleDemoClick}
                className="w-full bg-blue-600/30 text-white border border-white/30 hover:bg-blue-600/50 py-2"
                variant="outline"
                size="sm"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Демо версия
              </Button>
              
              <Button 
                onClick={handleBuyClick}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2"
                size="sm"
                disabled={!currentAudioBook.isPremium}
              >
                {currentAudioBook.isPremium && currentAudioBook.price && currentAudioBook.price > 0 
                  ? `Купить за ${currentAudioBook.price}₽` 
                  : 'Бесплатно'}
              </Button>
            </div>
          </>
        )}

        {/* Demo Timer */}
        {isDemoMode && (
          <div className="w-full mb-2">
            <div className="text-center text-red-500 text-sm font-medium">
              Демо: {Math.floor(demoTimeLeft / 60)}:{(demoTimeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full mb-3">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-100" 
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center justify-center space-x-6 mb-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSkipBack}
            className="text-gray-600 hover:bg-gray-100"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={handlePlayClick}
            size="icon"
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSkipForward}
            className="text-gray-600 hover:bg-gray-100"
          >
            <RotateCw className="w-5 h-5" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSpeedChange}
            className="text-gray-600 hover:bg-gray-100"
          >
            <div className="w-8 h-8 border-2 border-current rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">{getSpeedDisplay()}</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto relative">
            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </Button>

            <div className="p-8">
              {/* Title */}
              <div className="text-center mb-6">
                <Headphones className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Демо версия
                </h2>
                <p className="text-gray-600">
                  Демо версия длится 1 минуту
                </p>
              </div>

              {/* Listen Button */}
              <Button 
                className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3 mb-4"
                onClick={() => {
                  hapticFeedback.success();
                  startDemo();
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                Слушать
              </Button>
              
              <Button 
                variant="ghost"
                className="w-full py-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowDemoModal(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto relative">
            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </Button>

            <div className="p-8">
              {/* Title */}
              <h2 className="text-xl font-bold text-center mb-3 text-gray-800">
                Купить полную версию
              </h2>
              
              <p className="text-center text-gray-600 mb-8">
                Получите доступ ко всей аудиокниге "{currentAudioBook?.title}"
              </p>

              {/* Price Options */}
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-gray-700">Цифровая версия</span>
                  <span className="text-blue-500 font-bold text-lg">
                    {currentAudioBook?.price && currentAudioBook.price > 0 
                      ? `${currentAudioBook.price}₽` 
                      : 'Бесплатно'}
                  </span>
                </div>
              </div>

              {/* Purchase Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3"
                  onClick={() => {
                    hapticFeedback.success();
                    // Здесь будет логика покупки цифровой версии
                    setIsPurchased(true);
                    setIsDemoMode(false);
                    setShowPurchaseModal(false);
                  }}
                >
                  {currentAudioBook?.price && currentAudioBook.price > 0 
                    ? `Купить за ${currentAudioBook.price}₽` 
                    : 'Получить бесплатно'}
                </Button>
                
                <Button 
                  variant="ghost"
                  className="w-full py-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPurchaseModal(false)}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentAudioBook?.audioUrl || ""}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
}