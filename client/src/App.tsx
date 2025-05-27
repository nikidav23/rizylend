import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Reading from "@/pages/reading";
import Audio from "@/pages/audio";
import Shop from "@/pages/shop";
import Library from "@/pages/library";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { initTelegramApp } from "@/lib/telegram";
// Используем быстрые WebP изображения из папки public
const logo = "/logo.webp";
const characterReading = "/character2.webp";
const characterAudio = "/character3.webp";
const characterShop = "/character2.webp";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reading" component={Reading} />
      <Route path="/audio" component={Audio} />
      <Route path="/shop" component={Shop} />
      <Route path="/library" component={Library} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Глобальная предзагрузка изображений и инициализация Telegram
  useEffect(() => {
    // Инициализация Telegram Mini App
    initTelegramApp();
    
    // Предзагрузка изображений для предотвращения исчезновения при навигации
    const preloadImages = [logo, characterReading, characterAudio, characterShop];
    
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="telegram-mini-app">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
