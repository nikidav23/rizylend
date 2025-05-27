import { useState } from "react";
import { ArrowLeft, User, Settings, Crown, Bell, Shield, Info } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNavigation from "@/components/bottom-navigation";
import { hapticFeedback, getTelegramUser } from "@/lib/telegram";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);

  const telegramUser = getTelegramUser();

  const handleBack = () => {
    hapticFeedback.light();
    setLocation("/");
  };

  const handleSettingToggle = (setting: string, value: boolean) => {
    hapticFeedback.selection();
    switch (setting) {
      case "notifications":
        setNotifications(value);
        break;
      case "autoplay":
        setAutoplay(value);
        break;
      case "downloadOverWifi":
        setDownloadOverWifi(value);
        break;
    }
  };

  const handleMenuAction = (action: string) => {
    hapticFeedback.light();
    switch (action) {
      case "subscription":
        setLocation("/shop");
        break;
      case "support":
        // TODO: Open support chat
        break;
      case "about":
        // TODO: Show about modal
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto rizy-bg min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[hsl(var(--rizy-blue))] p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-white">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-white font-bold text-xl ml-2">Профиль</h1>
        </div>
      </header>

      <div className="p-4 pb-20 space-y-6">
        {/* User Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${telegramUser?.username || 'default'}`} />
                <AvatarFallback>
                  <User size={24} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  {telegramUser?.first_name || "Юный читатель"}
                </h2>
                <p className="text-gray-600">
                  @{telegramUser?.username || "username"}
                </p>
                <div className="flex items-center mt-2">
                  <Badge variant="secondary" className="mr-2">
                    Читатель
                  </Badge>
                  <Badge className="bg-[hsl(var(--rizy-green))] text-white">
                    Уровень 3
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Статистика чтения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--rizy-blue))]">12</div>
                <div className="text-sm text-gray-600">Книг прочитано</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--rizy-green))]">8</div>
                <div className="text-sm text-gray-600">Аудиокниг</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--rizy-yellow))]">45</div>
                <div className="text-sm text-gray-600">Часов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[hsl(var(--rizy-yellow))] rounded-full flex items-center justify-center">
                  <Crown size={20} className="text-gray-800" />
                </div>
                <div>
                  <h3 className="font-semibold">Премиум подписка</h3>
                  <p className="text-sm text-gray-600">Неактивна</p>
                </div>
              </div>
              <Button 
                onClick={() => handleMenuAction("subscription")}
                size="sm"
                className="bg-[hsl(var(--rizy-blue))] hover:bg-[hsl(var(--rizy-blue))]/90"
              >
                Подключить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings size={20} className="mr-2" />
              Настройки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell size={18} className="text-gray-600" />
                <div>
                  <div className="font-medium">Уведомления</div>
                  <div className="text-sm text-gray-600">О новых книгах</div>
                </div>
              </div>
              <Switch 
                checked={notifications}
                onCheckedChange={(value) => handleSettingToggle("notifications", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User size={18} className="text-gray-600" />
                <div>
                  <div className="font-medium">Автовоспроизведение</div>
                  <div className="text-sm text-gray-600">Следующая аудиокнига</div>
                </div>
              </div>
              <Switch 
                checked={autoplay}
                onCheckedChange={(value) => handleSettingToggle("autoplay", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield size={18} className="text-gray-600" />
                <div>
                  <div className="font-medium">Только Wi-Fi</div>
                  <div className="text-sm text-gray-600">Загрузка контента</div>
                </div>
              </div>
              <Switch 
                checked={downloadOverWifi}
                onCheckedChange={(value) => handleSettingToggle("downloadOverWifi", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => handleMenuAction("support")}
          >
            <Info size={18} className="mr-3" />
            Поддержка
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => handleMenuAction("about")}
          >
            <Info size={18} className="mr-3" />
            О приложении
          </Button>
        </div>

        {/* App Version */}
        <div className="text-center text-sm text-white/60">
          RIZY LAND версия 1.0.0
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
