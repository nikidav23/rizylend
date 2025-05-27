import { Home, Bookmark, User, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { hapticFeedback } from "@/lib/telegram";

export default function BottomNavigation() {
  const [location] = useLocation();

  const handleClick = () => {
    hapticFeedback.light();
  };

  const navItems = [
    { path: "/", icon: Home, label: "Главная" },
    { path: "/library", icon: Bookmark, label: "Библиотека" },
    { path: "/profile", icon: User, label: "Профиль" },
    { path: "/shop", icon: Settings, label: "Магазин" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive 
                  ? "text-[hsl(var(--rizy-blue))]" 
                  : "text-gray-400 hover:text-[hsl(var(--rizy-blue))]"
              }`}
              onClick={handleClick}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
