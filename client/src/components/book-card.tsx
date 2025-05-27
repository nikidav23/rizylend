import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";
import type { Book, AudioBook } from "@shared/schema";

interface BookCardProps {
  book: Book | AudioBook;
  onClick: () => void;
  type: "book" | "audio";
}

export default function BookCard({ book, onClick, type }: BookCardProps) {
  const isAudioBook = type === "audio" && "duration" in book;
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} мин`;
  };

  return (
    <Card 
      className="card-hover cursor-pointer animate-fade-in" 
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="aspect-[3/4] relative mb-3 overflow-hidden rounded-lg">
          <img
            src={book.coverImage ? `${book.coverImage}?t=${Date.now()}` : `https://via.placeholder.com/200x300/84CC16/ffffff?text=${encodeURIComponent(book.title)}`}
            alt={book.title}
            className="w-full h-full object-cover"
          />
          {book.isPremium && (
            <Badge className="absolute top-2 right-2 bg-[hsl(var(--rizy-yellow))] text-black">
              <Star size={12} className="mr-1" />
              Премиум
            </Badge>
          )}
        </div>
        
        <h3 className="font-bold text-sm mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-600 mb-2">{book.author}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            {isAudioBook 
              ? formatDuration(book.duration || 0)
              : `${(book as Book).readingTime || 0} мин`
            }
          </div>
          <span className="text-[hsl(var(--rizy-blue))] font-medium">
            {book.ageGroup}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[hsl(var(--rizy-blue))]">
            {book.price && book.price > 0 
              ? `${book.price}₽` 
              : 'Бесплатно'}
          </span>
        </div>
        
        {book.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {book.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
