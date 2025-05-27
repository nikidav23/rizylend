import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Clock, Star } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/bottom-navigation";
import { hapticFeedback } from "@/lib/telegram";
import type { UserLibrary, Book, AudioBook } from "@shared/schema";

// Mock user ID for demo
const MOCK_USER_ID = 1;

export default function Library() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");

  const { data: library = [], isLoading: libraryLoading } = useQuery<UserLibrary[]>({
    queryKey: ["/api/library", MOCK_USER_ID],
  });

  const { data: books = [], isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: audioBooks = [], isLoading: audioBooksLoading } = useQuery<AudioBook[]>({
    queryKey: ["/api/audio-books"],
  });

  const handleBack = () => {
    hapticFeedback.light();
    setLocation("/");
  };

  const handleItemSelect = (item: Book | AudioBook, type: "book" | "audio") => {
    hapticFeedback.selection();
    if (type === "book") {
      setLocation("/reading");
    } else {
      setLocation("/audio");
    }
  };

  const getBookById = (id: number | null): Book | undefined => {
    return id ? books.find(book => book.id === id) : undefined;
  };

  const getAudioBookById = (id: number | null): AudioBook | undefined => {
    return id ? audioBooks.find(audioBook => audioBook.id === id) : undefined;
  };

  const libraryBooks = library.filter(item => item.bookId).map(item => ({
    ...item,
    book: getBookById(item.bookId)
  })).filter(item => item.book);

  const libraryAudioBooks = library.filter(item => item.audioBookId).map(item => ({
    ...item,
    audioBook: getAudioBookById(item.audioBookId)
  })).filter(item => item.audioBook);

  const favorites = library.filter(item => item.isFavorite);
  const inProgress = library.filter(item => item.progress && item.progress > 0 && item.progress < 100);

  const renderLibraryItem = (libraryItem: UserLibrary, book?: Book, audioBook?: AudioBook) => {
    const item = book || audioBook;
    if (!item) return null;

    const type = book ? "book" : "audio";
    
    return (
      <Card 
        key={libraryItem.id} 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleItemSelect(item, type)}
      >
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <img
              src={item.coverImage || `https://via.placeholder.com/60x90/84CC16/ffffff?text=${encodeURIComponent(item.title)}`}
              alt={item.title}
              className="w-12 h-18 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{item.author}</p>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="text-xs">{item.ageGroup}</Badge>
                {item.isPremium && (
                  <Badge className="text-xs bg-[hsl(var(--rizy-yellow))] text-black">
                    <Star size={10} className="mr-1" />
                    Премиум
                  </Badge>
                )}
                {libraryItem.isFavorite && (
                  <Heart size={12} className="text-red-500 fill-current" />
                )}
              </div>

              {libraryItem.progress && libraryItem.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Прогресс</span>
                    <span>{libraryItem.progress}%</span>
                  </div>
                  <Progress value={libraryItem.progress} className="h-1" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-md mx-auto rizy-bg min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[hsl(var(--rizy-blue))] p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-white">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-white font-bold text-xl ml-2">Моя библиотека</h1>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-[hsl(var(--rizy-blue))]">
                {library.length}
              </div>
              <div className="text-xs text-gray-600">Всего</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-500">
                {favorites.length}
              </div>
              <div className="text-xs text-gray-600">Избранное</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-[hsl(var(--rizy-green))]">
                {inProgress.length}
              </div>
              <div className="text-xs text-gray-600">В процессе</div>
            </CardContent>
          </Card>
        </div>

        {/* Library Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">Все</TabsTrigger>
            <TabsTrigger value="books" className="text-xs">Книги</TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">Аудио</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">Избранное</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4 space-y-3">
            {libraryLoading || booksLoading || audioBooksLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <Skeleton className="w-12 h-18 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : library.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/80 text-lg mb-4">Ваша библиотека пуста</p>
                <Button onClick={() => setLocation("/")} variant="outline">
                  Найти книги
                </Button>
              </div>
            ) : (
              <>
                {libraryBooks.map(item => 
                  renderLibraryItem(item, item.book)
                )}
                {libraryAudioBooks.map(item => 
                  renderLibraryItem(item, undefined, item.audioBook)
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="books" className="mt-4 space-y-3">
            {libraryBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/80">Нет книг в библиотеке</p>
              </div>
            ) : (
              libraryBooks.map(item => 
                renderLibraryItem(item, item.book)
              )
            )}
          </TabsContent>
          
          <TabsContent value="audio" className="mt-4 space-y-3">
            {libraryAudioBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/80">Нет аудиокниг в библиотеке</p>
              </div>
            ) : (
              libraryAudioBooks.map(item => 
                renderLibraryItem(item, undefined, item.audioBook)
              )
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-4 space-y-3">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/80">Нет избранных элементов</p>
              </div>
            ) : (
              favorites.map(item => {
                const book = getBookById(item.bookId);
                const audioBook = getAudioBookById(item.audioBookId);
                return renderLibraryItem(item, book, audioBook);
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}
