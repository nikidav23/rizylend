import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { initTelegramApp, hapticFeedback, processTelegramPayment, showTelegramAlert } from "@/lib/telegram";
import { useQuery } from "@tanstack/react-query";
import type { Book } from "@shared/schema";

export default function Reading() {
  const [, setLocation] = useLocation();
  const [isPurchased, setIsPurchased] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [bookDragOffset, setBookDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  // Загружаем все книги из API
  const { data: books = [], isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const currentBook = books[currentBookIndex] || null;

  // Функция для разбиения текста на страницы с учетом размера шрифта
  const splitTextIntoPages = (text: string, fontSize: string) => {
    if (!text) return [];
    
    // Определяем максимальное количество символов в зависимости от размера шрифта
    let maxCharsPerPage;
    switch (fontSize) {
      case 'small':
        maxCharsPerPage = 700;
        break;
      case 'large':
        maxCharsPerPage = 400;
        break;
      default: // medium
        maxCharsPerPage = 550;
        break;
    }
    
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    const pages = [];
    let currentPage = '';
    
    for (const paragraph of paragraphs) {
      // Проверяем, поместится ли параграф на текущую страницу
      if (currentPage.length + paragraph.length + 2 <= maxCharsPerPage) {
        currentPage += (currentPage ? '\n\n' : '') + paragraph;
      } else {
        // Сохраняем текущую страницу, если она не пустая
        if (currentPage) {
          pages.push(currentPage);
          currentPage = '';
        }
        
        // Если параграф сам по себе слишком длинный, разбиваем его
        if (paragraph.length > maxCharsPerPage) {
          const sentences = paragraph.split('. ').filter(s => s.trim().length > 0);
          let tempPage = '';
          
          for (const sentence of sentences) {
            const sentenceWithDot = sentence.endsWith('!') || sentence.endsWith('?') || sentence.endsWith('.') ? sentence : sentence + '.';
            
            if (tempPage.length + sentenceWithDot.length + 1 <= maxCharsPerPage) {
              tempPage += (tempPage ? ' ' : '') + sentenceWithDot;
            } else {
              if (tempPage) {
                pages.push(tempPage);
                tempPage = sentenceWithDot;
              } else {
                // Если даже одно предложение слишком длинное, разбиваем по словам
                const words = sentenceWithDot.split(' ');
                let wordPage = '';
                for (const word of words) {
                  if (wordPage.length + word.length + 1 <= maxCharsPerPage) {
                    wordPage += (wordPage ? ' ' : '') + word;
                  } else {
                    if (wordPage) {
                      pages.push(wordPage);
                      wordPage = word;
                    }
                  }
                }
                tempPage = wordPage;
              }
            }
          }
          
          if (tempPage) {
            currentPage = tempPage;
          }
        } else {
          currentPage = paragraph;
        }
      }
    }
    
    if (currentPage) {
      pages.push(currentPage);
    }
    
    return pages;
  };

  const bookPages = currentBook ? splitTextIntoPages(currentBook.content || '', fontSize) : [];
  const totalPages = Math.max(bookPages.length, 1);

  useEffect(() => {
    initTelegramApp();
  }, []);

  // Предзагружаем обложки всех книг сразу при загрузке страницы
  useEffect(() => {
    if (books.length > 0) {
      books.forEach(book => {
        if (book.coverImage) {
          const img = new Image();
          img.src = `${book.coverImage}?t=${Date.now()}`;
          // Принудительно загружаем в кэш
          img.onload = () => {
            // Изображение загружено в кэш
          };
        }
      });
    }
  }, [books]);

  const handleDemoClick = () => {
    console.log("Demo button clicked!");
    hapticFeedback.light();
    setShowDemo(true);
  };

  const handlePurchaseClick = () => {
    console.log("Purchase button clicked!");
    hapticFeedback.light();
    if (isPurchased) {
      // Если уже куплено, открываем для чтения
      setShowDemo(true);
    } else {
      // Открываем модальное окно для оплаты
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = () => {
    if (currentBook && currentBook.price && currentBook.price > 0) {
      // Инициируем платеж через Telegram
      processTelegramPayment(currentBook.id, currentBook.price, currentBook.title);
      
      // Показываем уведомление пользователю
      showTelegramAlert(
        `Платеж на сумму ${currentBook.price}₽ за книгу "${currentBook.title}" инициирован!`,
        () => {
          setIsPurchased(true);
          setShowPaymentModal(false);
          setShowDemo(true);
        }
      );
    } else {
      // Бесплатная книга
      setIsPurchased(true);
      setShowPaymentModal(false);
      setShowDemo(true);
    }
  };

  // Touch handlers для перелистывания страниц
  const handlePageTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handlePageTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Ограничиваем перетаскивание
    const maxDrag = 150;
    const limitedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff));
    setDragOffset(limitedDiff);
  };

  // Touch handlers для переключения между книгами
  const handleBookTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setStartX(e.touches[0].clientX);
    setBookDragOffset(0);
  };

  const handleBookTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Ограничиваем перетаскивание
    const maxDrag = 200;
    const limitedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff));
    setBookDragOffset(limitedDiff);
  };

  const handlePageTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const threshold = 50; // минимальное расстояние для переключения страницы
    
    if (dragOffset > threshold && currentPage > 0) {
      // Свайп вправо - предыдущая страница
      setCurrentPage(currentPage - 1);
      hapticFeedback.light();
    } else if (dragOffset < -threshold && currentPage < totalPages - 1) {
      // Свайп влево - следующая страница
      setCurrentPage(currentPage + 1);
      hapticFeedback.light();
    }
    
    // Анимированно возвращаем к исходной позиции
    setTimeout(() => setDragOffset(0), 10);
  };

  const handleBookTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const threshold = 80; // минимальное расстояние для переключения книги
    
    if (Math.abs(bookDragOffset) > threshold && books.length > 1) {
      if (bookDragOffset > 0 && currentBookIndex > 0) {
        setCurrentBookIndex(currentBookIndex - 1);
        setCurrentPage(0); // Сбрасываем на первую страницу новой книги
        hapticFeedback.medium();
      } else if (bookDragOffset < 0 && currentBookIndex < books.length - 1) {
        setCurrentBookIndex(currentBookIndex + 1);
        setCurrentPage(0); // Сбрасываем на первую страницу новой книги
        hapticFeedback.medium();
      }
    }
    
    setBookDragOffset(0);
  };

  // Функции для навигации по книгам кнопками
  const goToPreviousBook = () => {
    if (currentBookIndex > 0) {
      setCurrentBookIndex(currentBookIndex - 1);
      setCurrentPage(0);
      hapticFeedback.medium();
    }
  };

  const goToNextBook = () => {
    if (currentBookIndex < books.length - 1) {
      setCurrentBookIndex(currentBookIndex + 1);
      setCurrentPage(0);
      hapticFeedback.medium();
    }
  };

  if (showDemo) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen relative overflow-hidden">
        {/* Кнопка назад к обложке */}
        <Button 
          onClick={() => {
            hapticFeedback.light();
            setShowDemo(false);
          }}
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 text-gray-700 hover:bg-gray-100 z-40"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Страницы с перелистыванием */}
        <div 
          className="flex h-full transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${currentPage * 100}% + ${dragOffset}px))`,
            willChange: 'transform',
            touchAction: 'none',
            userSelect: 'none'
          }}
          onTouchStart={handlePageTouchStart}
          onTouchMove={handlePageTouchMove}
          onTouchEnd={handlePageTouchEnd}
        >
          {bookPages.map((pageContent, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 bg-white">
              <div className="pt-16 px-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                  {currentBook?.title}
                </h2>
                
                {/* Добавляем изображение на первую страницу для книги "Колобок" */}
                {index === 0 && currentBook?.title.includes("Колобок") && (
                  <div className="mb-6 flex justify-center">
                    <img 
                      src={currentBook.coverImage || "/kolobok-cover.webp"} 
                      alt="Колобок" 
                      className="w-32 h-40 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
                
                <div className={`text-gray-700 leading-relaxed ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
                  {pageContent.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Индикатор страниц - кликабельный */}
        <div 
          className="fixed top-1 left-1/2 transform -translate-x-1/2 bg-black/20 rounded-full px-4 py-2 z-50 cursor-pointer"
          onClick={() => {
            hapticFeedback.light();
            setShowMenu(true);
          }}
        >
          <span className="text-white text-sm font-medium">
            {currentPage + 1} / {totalPages}
          </span>
        </div>

        {/* Меню настроек */}
        {showMenu && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 mx-6 w-full max-w-sm">
              {/* Кнопка "Назад к книге" */}
              <Button 
                onClick={() => setShowMenu(false)}
                variant="ghost" 
                className="w-full mb-6 justify-start text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к книге
              </Button>

              {/* Размер шрифта */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Размер шрифта</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={fontSize === 'small' ? 'default' : 'outline'}
                    className={`text-sm h-12 ${fontSize === 'small' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                    onClick={() => setFontSize('small')}
                  >
                    Aa<br />
                    <span className="text-xs">Малый</span>
                  </Button>
                  <Button
                    variant={fontSize === 'medium' ? 'default' : 'outline'}
                    className={`text-base h-12 ${fontSize === 'medium' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                    onClick={() => setFontSize('medium')}
                  >
                    Aa<br />
                    <span className="text-xs">Средний</span>
                  </Button>
                  <Button
                    variant={fontSize === 'large' ? 'default' : 'outline'}
                    className={`text-lg h-12 ${fontSize === 'large' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                    onClick={() => setFontSize('large')}
                  >
                    Aa<br />
                    <span className="text-xs">Большой</span>
                  </Button>
                </div>
              </div>

              {/* Кнопка "Закрыть" */}
              <Button 
                onClick={() => setShowMenu(false)}
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
              >
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Если нет книг или загрузка, показываем загрузку
  if (booksLoading || !currentBook) {
    return (
      <div className="max-w-md mx-auto bg-[#0536d4] min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p>Загружаем книги...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-[#0536d4] min-h-screen relative overflow-hidden flex flex-col">
      {/* Header */}
      <header className="relative z-10 p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/20"
          onClick={() => {
            hapticFeedback.light();
            setLocation("/");
          }}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        {/* Навигация между книгами */}
        {books.length > 1 && (
          <>
            {currentBookIndex > 0 && (
              <Button 
                onClick={goToPreviousBook}
                variant="ghost" 
                size="icon" 
                className="absolute top-4 left-16 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}
            
            {currentBookIndex < books.length - 1 && (
              <Button 
                onClick={goToNextBook}
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}

            {/* Индикатор текущей книги */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {books.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentBookIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </header>

      {/* Book Cover Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Book Cover */}
        <div className="mb-6">
          <div className="w-40 h-52 bg-white/10 rounded-2xl shadow-2xl flex items-center justify-center mb-4 overflow-hidden relative">
            {/* Предзагруженное изображение */}
            <img
              src={currentBook.coverImage || "/book-cover-fantasy.webp"}
              alt={currentBook.title}
              className="w-full h-full object-cover rounded-2xl opacity-100"
              loading="eager"
              style={{ display: 'block' }}
            />
          </div>
        </div>

        {/* Book Info */}
        <div className="text-center text-white mb-8">
          <h1 className="text-2xl font-bold mb-2">{currentBook.title}</h1>
          <p className="text-base opacity-90 mb-4">{currentBook.author} ›</p>
          
          <div className="flex items-center justify-center space-x-2 text-sm opacity-80 mb-6">
            <BookOpen className="w-4 h-4" />
            <span>Книга</span>
            <span>{currentBook.ageGroup}</span>
            <span>-</span>
            <span>{currentBook.readingTime || 20} мин</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 px-6">
          <Button
            onClick={handleDemoClick}
            className="w-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0536d4] transition-all duration-200 h-12 text-base font-medium rounded-xl"
          >
            Демоверсия
          </Button>
          
          <Button
            onClick={handlePurchaseClick}
            className="w-full bg-white text-[#0536d4] hover:bg-gray-100 transition-all duration-200 h-12 text-base font-medium rounded-xl"
          >
            {currentBook?.price && currentBook.price > 0 
              ? `Купить за ${currentBook.price}₽` 
              : 'Получить бесплатно'}
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto relative">
            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowPaymentModal(false)}
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
                Получите доступ ко всей книге "{currentBook.title}"
              </p>

              {/* Price Options */}
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-gray-700">Цифровая версия</span>
                  <span className="text-blue-500 font-bold text-lg">
                    {currentBook.price && currentBook.price > 0 
                      ? `${currentBook.price}₽` 
                      : 'Бесплатно'}
                  </span>
                </div>
              </div>

              {/* Purchase Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3"
                  onClick={handlePaymentComplete}
                >
                  {currentBook.price && currentBook.price > 0 
                    ? `Купить за ${currentBook.price}₽` 
                    : 'Получить бесплатно'}
                </Button>
                
                <Button 
                  variant="ghost"
                  className="w-full py-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}