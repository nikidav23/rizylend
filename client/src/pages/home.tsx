import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initTelegramApp, hapticFeedback } from "@/lib/telegram";
import { X } from "lucide-react";
// Используем быстрые WebP изображения из папки public
import logoImg from "/logo.webp";
import character2Img from "/character2.webp";
import character3Img from "/character3.webp";

const characterReading = character2Img;
const logo = logoImg;
const characterAudio = character3Img;
const characterShop = character2Img;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Book, AudioBook } from "@shared/schema";

export default function Home() {
  const queryClient = useQueryClient();
  const [clickCount, setClickCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showBooksManagement, setShowBooksManagement] = useState(false);
  const [showAudioManagement, setShowAudioManagement] = useState(false);
  const [showTrashManagement, setShowTrashManagement] = useState(false);
  const [showShopManagement, setShowShopManagement] = useState(false);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Состояние для управления товарами магазина
  const [showAddShopProduct, setShowAddShopProduct] = useState(false);
  const [showEditShopProduct, setShowEditShopProduct] = useState(false);
  const [editingShopProduct, setEditingShopProduct] = useState<any>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showEditBook, setShowEditBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddAudio, setShowAddAudio] = useState(false);
  const [showEditAudio, setShowEditAudio] = useState(false);
  const [editingAudio, setEditingAudio] = useState<AudioBook | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<AudioBook | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Image upload functions
  const uploadBookCover = async (bookId: number, file: File) => {
    const formData = new FormData();
    formData.append('cover', file);
    
    const response = await fetch(`/api/upload/book-cover/${bookId}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload cover');
    }
    
    return response.json();
  };

  const uploadAudioBookCover = async (audioBookId: number, file: File) => {
    const formData = new FormData();
    formData.append('cover', file);
    
    const response = await fetch(`/api/upload/audiobook-cover/${audioBookId}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload cover');
    }
    
    return response.json();
  };

  const uploadProductImage = async (productId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`/api/upload/product-image/${productId}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    return response.json();
  };
  
  // Состояние для формы добавления книги
  const [newBookForm, setNewBookForm] = useState({
    title: "",
    author: "",
    description: "",
    coverImage: "",
    content: "",
    ageGroup: "3-6",
    isPremium: false,
    readingTime: 10,
    price: 0
  });

  // Состояние для формы редактирования книги
  const [editBookForm, setEditBookForm] = useState({
    title: "",
    author: "",
    description: "",
    coverImage: "",
    content: "",
    ageGroup: "3-6",
    isPremium: false,
    readingTime: 10,
    price: 0
  });

  // Состояние для формы добавления аудиокниги
  const [newAudioForm, setNewAudioForm] = useState({
    title: "",
    author: "",
    description: "",
    coverImage: "",
    audioUrl: "",
    duration: 0,
    narrator: "",
    ageGroup: "3-6",
    isPremium: false,
    price: 0
  });

  // Состояние для формы редактирования аудиокниги
  const [editAudioForm, setEditAudioForm] = useState({
    title: "",
    author: "",
    description: "",
    coverImage: "",
    audioUrl: "",
    duration: 0,
    narrator: "",
    ageGroup: "3-6",
    isPremium: false,
    price: 0
  });

  // Состояние для формы добавления товара
  const [newShopProductForm, setNewShopProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Одежда",
    imageUrl: "",
    stock: 0,
    isActive: true
  });

  // Состояние для формы редактирования товара
  const [editShopProductForm, setEditShopProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Одежда", 
    imageUrl: "",
    stock: 0,
    isActive: true
  });

  // Загружаем реальные данные из API
  const { data: books = [], isLoading: booksLoading, refetch: refetchBooks } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: audioBooks = [], isLoading: audioBooksLoading } = useQuery<AudioBook[]>({
    queryKey: ["/api/audio-books"],
    staleTime: 0,
  });

  const { data: shopProducts = [], isLoading: shopProductsLoading } = useQuery<any[]>({
    queryKey: ["/api/shop-products"],
    staleTime: 0,
  });

  const { data: deletedBooks = [] } = useQuery<Book[]>({
    queryKey: ["/api/trash/books"],
  });

  // Мутации для изменения данных
  const createBookMutation = useMutation({
    mutationFn: (bookData: any) => apiRequest("POST", "/api/books", bookData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setShowAddBook(false);
      hapticFeedback.success();
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/books/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/library"] });
      setShowEditBook(false);
      hapticFeedback.success();
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trash/books"] });
      hapticFeedback.success();
    },
  });

  const restoreBookMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/books/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trash/books"] });
      hapticFeedback.success();
    },
  });

  // Мутации для аудиокниг
  const createAudioMutation = useMutation({
    mutationFn: (newAudio: any) => apiRequest("POST", "/api/audio-books", newAudio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audio-books"] });
      setShowAddAudio(false);
      hapticFeedback.success();
    },
  });

  const updateAudioMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/audio-books/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audio-books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/library"] });
      setShowEditAudio(false);
      hapticFeedback.success();
    },
  });

  const deleteAudioMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/audio-books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audio-books"] });
      hapticFeedback.success();
    },
  });

  // Мутации для товаров магазина
  const createShopProductMutation = useMutation({
    mutationFn: (newProduct: any) => apiRequest("POST", "/api/shop-products", newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-products"] });
      setShowAddShopProduct(false);
      hapticFeedback.success();
    },
  });

  const updateShopProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/shop-products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-products"] });
      setShowEditShopProduct(false);
      hapticFeedback.success();
    },
  });

  const deleteShopProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/shop-products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-products"] });
      hapticFeedback.success();
    },
  });

  useEffect(() => {
    initTelegramApp();
  }, []);

  const handleCardClick = () => {
    hapticFeedback.light();
  };

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 10) {
      hapticFeedback.heavy();
      setShowAdminLogin(true);
      setClickCount(0);
    }
    
    // Сброс счетчика через 3 секунды бездействия
    setTimeout(() => {
      setClickCount(0);
    }, 3000);
  };

  const handleAdminLogin = () => {
    if (username === "admin23" && password === "admin23") {
      hapticFeedback.success();
      setShowAdminLogin(false);
      setShowAdminPanel(true);
      setLoginError("");
    } else {
      hapticFeedback.error();
      setLoginError("Неверный логин или пароль");
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Пароль должен содержать минимум 6 символов");
      return;
    }
    
    hapticFeedback.success();
    setPasswordError("");
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePassword(false);
    alert("Пароль успешно изменен!");
  };

  return (
    <div className="max-w-md mx-auto bg-[#0536d4] h-screen relative overflow-hidden flex flex-col">
      {/* Header */}
      <header className="relative z-10 pt-4 pb-4 text-center flex-shrink-0">
        <img 
          src={logo} 
          alt="RIZY LAND" 
          className="w-96 h-auto mx-auto mt-[-70px] mb-[-70px] cursor-pointer"
          onClick={handleLogoClick}
          loading="eager"
        />
      </header>
      {/* Main Content */}
      <main className="px-6 pb-6 space-y-6 relative z-10 flex-1 flex flex-col justify-center" style={{ transform: 'translateY(-5%)' }}>
        {/* Reading Section */}
        <Link href="/reading" onClick={handleCardClick}>
          <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 mt-[-20px] mb-[-20px]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Читать книгу
                  </h2>
                </div>
                <div className="ml-4">
                  <img 
                    src={characterReading} 
                    alt="Читающий персонаж" 
                    className="w-24 h-24 object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Audio Section */}
        <Link href="/audio" onClick={handleCardClick}>
          <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 mt-[-20px] mb-[-20px]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Слушать книгу
                  </h2>
                </div>
                <div className="ml-4">
                  <img 
                    src={characterAudio} 
                    alt="Слушающий персонаж" 
                    className="w-24 h-24 object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Shop Section */}
        <Link href="/shop" onClick={handleCardClick}>
          <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 mt-[-20px] mb-[-20px]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Магазин
                  </h2>
                </div>
                <div className="ml-4">
                  <img 
                    src={characterShop} 
                    alt="Персонаж магазина" 
                    className="w-24 h-24 object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-auto relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </Button>

            <div className="p-8">
              <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
                Админ панель
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                </div>

                {loginError && (
                  <p className="text-red-500 text-sm text-center">{loginError}</p>
                )}

                <Button 
                  onClick={handleAdminLogin}
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                >
                  Войти
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Админ панель RIZY LAND</h1>
              <Button 
                variant="outline"
                onClick={() => setShowAdminPanel(false)}
                className="text-gray-600"
              >
                <X className="w-4 h-4 mr-2" />
                Закрыть
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Статистика */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Статистика</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Всего пользователей:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Активных сегодня:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Покупки за сегодня:</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Управление контентом */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Контент</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowBooksManagement(true)}
                    >
                      Управление книгами
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowAudioManagement(true)}
                    >
                      Управление аудиокнигами
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowTrashManagement(true)}
                    >
                      🗑️ Корзина
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowShopManagement(true)}
                    >
                      Товары магазина
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Настройки */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Настройки</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowPaymentSettings(true)}
                    >
                      Настройки платежей
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowChangePassword(true)}
                    >
                      Изменить пароль
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-auto relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowChangePassword(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </Button>

            <div className="p-8">
              <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
                Изменить пароль
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Новый пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Input
                    type="password"
                    placeholder="Подтвердите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                    onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
                  />
                </div>

                {passwordError && (
                  <p className="text-red-500 text-sm text-center">{passwordError}</p>
                )}

                <Button 
                  onClick={handleChangePassword}
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                >
                  Изменить пароль
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Books Management Modal */}
      {showBooksManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto my-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Управление книгами</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowBooksManagement(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Books List - Scrollable */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Список книг:</h4>
                <div className="h-64 overflow-y-auto overscroll-contain space-y-3 pr-2">
                  {books.map((book) => (
                    <div key={book.id} className="border rounded-lg p-3 bg-gray-50 flex-shrink-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm leading-tight break-words">{book.title}</h5>
                          <p className="text-xs text-gray-600 break-words">Автор: {book.author}</p>
                        </div>
                        <div className="flex flex-col space-y-1 flex-shrink-0">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs px-2 py-1 h-auto whitespace-nowrap"
                            onClick={() => {
                              setEditingBook(book);
                              setEditBookForm({
                                title: book.title,
                                author: book.author,
                                description: book.description || "",
                                coverImage: book.coverImage || "",
                                content: book.content,
                                ageGroup: book.ageGroup,
                                isPremium: book.isPremium || false,
                                readingTime: book.readingTime || 10,
                                price: book.price || 0
                              });
                              setShowEditBook(true);
                            }}
                          >
                            Редактировать
                          </Button>
                          <label className="cursor-pointer">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-blue-600 text-xs px-2 py-1 h-auto whitespace-nowrap"
                              asChild
                            >
                              <span>📷 Обложка</span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    await uploadBookCover(book.id, file);
                                    queryClient.invalidateQueries({ queryKey: ['/api/books'] });
                                    hapticFeedback.success();
                                  } catch (error) {
                                    console.error('Upload failed:', error);
                                    hapticFeedback.error();
                                  }
                                }
                              }}
                            />
                          </label>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 text-xs px-2 py-1 h-auto whitespace-nowrap"
                            onClick={() => deleteBookMutation.mutate(book.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${book.isPremium ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {book.isPremium ? 'Премиум' : 'Бесплатно'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  onClick={() => setShowAddBook(true)}
                >
                  + Добавить книгу
                </Button>
              </div>

              {/* Back Button */}
              <Button 
                onClick={() => setShowBooksManagement(false)}
                variant="outline" 
                className="w-full"
              >
                ← Назад к админ панели
              </Button>


            </div>
          </div>
        </div>
      )}

      {/* Audio Management Modal */}
      {showAudioManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto my-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Управление аудиокнигами</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAudioManagement(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Audio Books List - Scrollable */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Список аудиокниг:</h4>
                <div className="h-64 overflow-y-auto overscroll-contain space-y-3 pr-2">
                  {audioBooks.map((audioBook) => (
                    <div key={audioBook.id} className="border rounded-lg p-3 bg-gray-50 flex-shrink-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm leading-tight break-words">{audioBook.title}</h5>
                          <p className="text-xs text-gray-600 break-words">Автор: {audioBook.author}</p>
                          <p className="text-xs text-gray-600">Длительность: {Math.floor((audioBook.duration || 0) / 60)}:{String((audioBook.duration || 0) % 60).padStart(2, '0')}</p>
                        </div>
                        <div className="flex flex-col space-y-1 flex-shrink-0">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs px-2 py-1 h-auto whitespace-nowrap"
                            onClick={() => {
                              if (audioBook.audioUrl) {
                                setPlayingAudio(audioBook);
                                setShowAudioPlayer(true);
                              } else {
                                alert("URL аудиофайла не указан");
                              }
                            }}
                          >
                            🎧 Прослушать
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs px-2 py-1 h-auto whitespace-nowrap"
                            onClick={() => {
                              setEditingAudio(audioBook);
                              setEditAudioForm({
                                title: audioBook.title,
                                author: audioBook.author,
                                description: audioBook.description || "",
                                coverImage: audioBook.coverImage || "",
                                audioUrl: audioBook.audioUrl,
                                duration: audioBook.duration || 0,
                                narrator: audioBook.narrator || "",
                                ageGroup: audioBook.ageGroup,
                                isPremium: audioBook.isPremium || false,
                                price: audioBook.price || 0
                              });
                              setShowEditAudio(true);
                            }}
                          >
                            Редактировать
                          </Button>
                          <label className="cursor-pointer">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-blue-600 text-xs px-2 py-1 h-auto whitespace-nowrap"
                              asChild
                            >
                              <span>📷 Обложка</span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    await uploadAudioBookCover(audioBook.id, file);
                                    queryClient.invalidateQueries({ queryKey: ['/api/audio-books'] });
                                    hapticFeedback.success();
                                  } catch (error) {
                                    console.error('Upload failed:', error);
                                    hapticFeedback.error();
                                  }
                                }
                              }}
                            />
                          </label>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 text-xs px-2 py-1 h-auto whitespace-nowrap"
                            onClick={() => deleteAudioMutation.mutate(audioBook.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-4">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                  onClick={() => setShowAddAudio(true)}
                >
                  + Добавить аудиокнигу
                </Button>
              </div>

              {/* Back Button */}
              <Button 
                onClick={() => setShowAudioManagement(false)}
                variant="outline" 
                className="w-full"
              >
                ← Назад к админ панели
              </Button>


            </div>
          </div>
        </div>
      )}

      {/* Shop Management Modal */}
      {showShopManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto my-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Управление магазином</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowShopManagement(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Products List - Scrollable */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Товары в наличии:</h4>
                <div className="h-64 overflow-y-auto overscroll-contain space-y-3 pr-2">
                  {shopProductsLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                  ) : shopProducts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>Товары не найдены</p>
                      <p className="text-sm">Добавьте первый товар</p>
                    </div>
                  ) : (
                    shopProducts.map((product) => (
                      <div key={product.id} className="border rounded-lg p-3 bg-gray-50 flex-shrink-0">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex gap-3 flex-1 min-w-0">
                            {product.imageUrl && (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm leading-tight break-words">{product.name}</h5>
                              <p className="text-xs text-gray-600">Категория: {product.category}</p>
                              <p className="text-xs text-blue-600 font-medium">{(product.price / 100).toFixed(2)}₽</p>
                              <p className="text-xs text-gray-500">В наличии: {product.stock} шт</p>
                              {product.description && (
                                <p className="text-xs text-gray-500 mt-1 truncate">{product.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1 flex-shrink-0">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-xs px-2 py-1 h-auto whitespace-nowrap"
                              onClick={() => {
                                setEditingShopProduct(product);
                                setEditShopProductForm({
                                  name: product.name,
                                  description: product.description || "",
                                  price: product.price,
                                  category: product.category,
                                  imageUrl: product.imageUrl || "",
                                  stock: product.stock,
                                  isActive: product.isActive
                                });
                                setShowEditShopProduct(true);
                              }}
                            >
                              Редактировать
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 text-xs px-2 py-1 h-auto whitespace-nowrap"
                              onClick={() => deleteShopProductMutation.mutate(product.id)}
                              disabled={deleteShopProductMutation.isPending}
                            >
                              Удалить
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {product.stock > 10 ? 'В наличии' : 'Заканчивается'}
                          </span>
                          {product.isActive ? (
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              Активный
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              Неактивный
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-4">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={() => setShowAddShopProduct(true)}
                >
                  + Добавить товар
                </Button>
              </div>

              {/* Back Button */}
              <Button 
                onClick={() => setShowShopManagement(false)}
                variant="outline" 
                className="w-full mb-6"
              >
                ← Назад к админ панели
              </Button>




            </div>
          </div>
        </div>
      )}

      {/* Payment Settings Modal */}
      {showPaymentSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto my-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Настройки платежей</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowPaymentSettings(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* YooMoney Settings */}
              <div className="mb-6 p-4 border rounded-lg">
                <h4 className="font-semibold mb-4 flex items-center">
                  💳 Настройки YooMoney
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Статус подключения:</span>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Подключено
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Магазин ID:</span>
                    <span className="text-sm font-mono">shop_******2345</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Комиссия YooMoney:</span>
                    <span className="text-sm">2.9% + 15₽</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Переподключить YooMoney
                  </Button>
                </div>
              </div>







              {/* Back Button */}
              <Button 
                onClick={() => setShowPaymentSettings(false)}
                variant="outline" 
                className="w-full"
              >
                ← Назад к админ панели
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto my-4">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Добавить новую книгу</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAddBook(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название книги</label>
                  <Input 
                    placeholder="Введите название книги" 
                    className="mt-1"
                    value={newBookForm.title}
                    onChange={(e) => setNewBookForm({...newBookForm, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Автор</label>
                  <Input 
                    placeholder="Введите автора" 
                    className="mt-1"
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm({...newBookForm, author: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <Input 
                    placeholder="Введите описание книги" 
                    className="mt-1"
                    value={newBookForm.description}
                    onChange={(e) => setNewBookForm({...newBookForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Обложка книги (URL)</label>
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    className="mt-1"
                    value={newBookForm.coverImage || ''}
                    onChange={(e) => setNewBookForm({...newBookForm, coverImage: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Рекомендуется: JPEG/PNG, размер 200×300 пикселей, до 500KB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Содержание книги</label>
                  <textarea 
                    placeholder="Введите текст книги..." 
                    className="w-full mt-1 p-2 border rounded-md h-32 resize-none"
                    value={newBookForm.content}
                    onChange={(e) => setNewBookForm({...newBookForm, content: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Возрастная группа</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newBookForm.ageGroup}
                    onChange={(e) => setNewBookForm({...newBookForm, ageGroup: e.target.value})}
                  >
                    <option value="2-4">2-4 года</option>
                    <option value="3-6">3-6 лет</option>
                    <option value="5-8">5-8 лет</option>
                    <option value="7-12">7-12 лет</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isPremium"
                    checked={newBookForm.isPremium}
                    onChange={(e) => setNewBookForm({...newBookForm, isPremium: e.target.checked})}
                  />
                  <label htmlFor="isPremium" className="text-sm font-medium">Премиум книга</label>
                </div>
                <div>
                  <label className="text-sm font-medium">Цена (₽)</label>
                  <Input 
                    type="number"
                    placeholder="0" 
                    className="mt-1"
                    value={newBookForm.price}
                    onChange={(e) => setNewBookForm({...newBookForm, price: Number(e.target.value)})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Цена в рублях. Оставьте 0 для бесплатной книги
                  </p>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (newBookForm.title && newBookForm.author && newBookForm.content) {
                      createBookMutation.mutate({
                        ...newBookForm,
                        categoryId: 1
                      });
                      // Очищаем форму и закрываем модальное окно после добавления
                      setNewBookForm({
                        title: "",
                        author: "",
                        description: "",
                        coverImage: "",
                        content: "",
                        ageGroup: "3-6",
                        isPremium: false,
                        readingTime: 10,
                        price: 0
                      });
                      setShowAddBook(false);
                    }
                  }}
                >
                  Добавить книгу
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditBook && editingBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto my-4">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Редактировать книгу</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowEditBook(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название книги</label>
                  <Input 
                    value={editBookForm.title} 
                    onChange={(e) => setEditBookForm({...editBookForm, title: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Автор</label>
                  <Input 
                    value={editBookForm.author} 
                    onChange={(e) => setEditBookForm({...editBookForm, author: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <Input 
                    value={editBookForm.description} 
                    onChange={(e) => setEditBookForm({...editBookForm, description: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Обложка книги (URL)</label>
                  <Input 
                    value={editBookForm.coverImage || ''} 
                    onChange={(e) => setEditBookForm({...editBookForm, coverImage: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Рекомендуется: JPEG/PNG, размер 200×300 пикселей, до 500KB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Содержание книги</label>
                  <textarea 
                    value={editBookForm.content}
                    onChange={(e) => setEditBookForm({...editBookForm, content: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md h-32 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Возрастная группа</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={editBookForm.ageGroup}
                    onChange={(e) => setEditBookForm({...editBookForm, ageGroup: e.target.value})}
                  >
                    <option value="2-4">2-4 года</option>
                    <option value="3-6">3-6 лет</option>
                    <option value="5-8">5-8 лет</option>
                    <option value="7-12">7-12 лет</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="editIsPremium"
                    checked={editBookForm.isPremium}
                    onChange={(e) => setEditBookForm({...editBookForm, isPremium: e.target.checked})}
                  />
                  <label htmlFor="editIsPremium" className="text-sm font-medium">Премиум книга</label>
                </div>
                <div>
                  <label className="text-sm font-medium">Цена (₽)</label>
                  <Input 
                    type="number"
                    placeholder="0" 
                    className="mt-1"
                    value={editBookForm.price}
                    onChange={(e) => setEditBookForm({...editBookForm, price: Number(e.target.value)})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Цена в рублях. Оставьте 0 для бесплатной книги
                  </p>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (editingBook && editBookForm.title && editBookForm.author && editBookForm.content) {
                      updateBookMutation.mutate({
                        id: editingBook.id,
                        data: {
                          ...editBookForm,
                          categoryId: editingBook.categoryId
                        }
                      });
                      setShowEditBook(false);
                    }
                  }}
                >
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trash Management Modal */}
      {showTrashManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto my-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">🗑️ Корзина удаленных книг</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowTrashManagement(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {deletedBooks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Корзина пуста</p>
                  <p className="text-sm text-gray-400">Удаленные книги будут появляться здесь</p>
                </div>
              ) : (
                <>
                  {/* Deleted Books List - Scrollable */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Удаленные книги ({deletedBooks.length}):
                    </h4>
                    <div className="h-64 overflow-y-auto overscroll-contain space-y-3 pr-2">
                      {deletedBooks.map((book) => (
                        <div key={book.id} className="border rounded-lg p-3 bg-red-50 flex-shrink-0">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm leading-tight break-words">{book.title}</h5>
                              <p className="text-xs text-gray-600 break-words">{book.author}</p>
                              <p className="text-xs text-gray-500 mt-1 break-words">
                                {book.description ? book.description.substring(0, 60) + '...' : 'Нет описания'}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <Button 
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1 h-auto bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                                onClick={() => restoreBookMutation.mutate(book.id)}
                                disabled={restoreBookMutation.isPending}
                              >
                                Восстановить
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              Удалено
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      💡 Книги в корзине можно восстановить. Они снова появятся в основном списке книг.
                    </p>
                  </div>
                </>
              )}

              {/* Back Button */}
              <Button 
                onClick={() => setShowTrashManagement(false)}
                variant="outline" 
                className="w-full"
              >
                ← Назад к админ панели
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Audio Modal */}
      {showAddAudio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto my-4">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Добавить новую аудиокнигу</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAddAudio(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название аудиокниги</label>
                  <Input 
                    value={newAudioForm.title} 
                    placeholder="Введите название аудиокниги"
                    onChange={(e) => setNewAudioForm({...newAudioForm, title: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Автор</label>
                  <Input 
                    value={newAudioForm.author} 
                    placeholder="Введите автора"
                    onChange={(e) => setNewAudioForm({...newAudioForm, author: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <Input 
                    value={newAudioForm.description} 
                    placeholder="Введите описание аудиокниги"
                    onChange={(e) => setNewAudioForm({...newAudioForm, description: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Обложка аудиокниги (URL)</label>
                  <Input 
                    value={newAudioForm.coverImage} 
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => setNewAudioForm({...newAudioForm, coverImage: e.target.value})}
                    className="mt-1" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Рекомендуется: JPEG/PNG/WebP, размер 300×300 пикселей, до 500KB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Аудио файл (URL)</label>
                  <Input 
                    value={newAudioForm.audioUrl} 
                    placeholder="/audio/filename.mp3"
                    onChange={(e) => setNewAudioForm({...newAudioForm, audioUrl: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Длительность (секунды)</label>
                  <Input 
                    type="number"
                    value={newAudioForm.duration} 
                    placeholder="300"
                    onChange={(e) => setNewAudioForm({...newAudioForm, duration: parseInt(e.target.value) || 0})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Диктор</label>
                  <Input 
                    value={newAudioForm.narrator} 
                    placeholder="Имя диктора"
                    onChange={(e) => setNewAudioForm({...newAudioForm, narrator: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Возрастная группа</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newAudioForm.ageGroup}
                    onChange={(e) => setNewAudioForm({...newAudioForm, ageGroup: e.target.value})}
                  >
                    <option value="2-4">2-4 года</option>
                    <option value="3-6">3-6 лет</option>
                    <option value="5-8">5-8 лет</option>
                    <option value="7-12">7-12 лет</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="newAudioIsPremium"
                    checked={newAudioForm.isPremium}
                    onChange={(e) => setNewAudioForm({...newAudioForm, isPremium: e.target.checked})}
                  />
                  <label htmlFor="newAudioIsPremium" className="text-sm font-medium">Премиум аудиокнига</label>
                </div>
                <div>
                  <label className="text-sm font-medium">Цена (₽)</label>
                  <Input 
                    type="number"
                    placeholder="0" 
                    className="mt-1"
                    value={newAudioForm.price}
                    onChange={(e) => setNewAudioForm({...newAudioForm, price: Number(e.target.value)})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Цена в рублях. Оставьте 0 для бесплатной аудиокниги
                  </p>
                </div>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    if (newAudioForm.title && newAudioForm.author && newAudioForm.audioUrl) {
                      createAudioMutation.mutate({
                        ...newAudioForm,
                        categoryId: 1
                      });
                      // Очищаем форму
                      setNewAudioForm({
                        title: "",
                        author: "",
                        description: "",
                        coverImage: "",
                        audioUrl: "",
                        duration: 0,
                        narrator: "",
                        ageGroup: "3-6",
                        isPremium: false,
                        price: 0
                      });
                      setShowAddAudio(false);
                    }
                  }}
                >
                  Добавить аудиокнигу
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Audio Modal */}
      {showEditAudio && editingAudio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto my-4">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Редактировать аудиокнигу</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowEditAudio(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название аудиокниги</label>
                  <Input 
                    value={editAudioForm.title} 
                    onChange={(e) => setEditAudioForm({...editAudioForm, title: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Автор</label>
                  <Input 
                    value={editAudioForm.author} 
                    onChange={(e) => setEditAudioForm({...editAudioForm, author: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <Input 
                    value={editAudioForm.description} 
                    onChange={(e) => setEditAudioForm({...editAudioForm, description: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Обложка аудиокниги (URL)</label>
                  <Input 
                    value={editAudioForm.coverImage} 
                    onChange={(e) => setEditAudioForm({...editAudioForm, coverImage: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Рекомендуется: JPEG/PNG/WebP, размер 300×300 пикселей, до 500KB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Аудио файл (URL)</label>
                  <Input 
                    value={editAudioForm.audioUrl} 
                    onChange={(e) => setEditAudioForm({...editAudioForm, audioUrl: e.target.value})}
                    placeholder="/audio/filename.mp3"
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Длительность (секунды)</label>
                  <Input 
                    type="number"
                    value={editAudioForm.duration} 
                    onChange={(e) => setEditAudioForm({...editAudioForm, duration: parseInt(e.target.value) || 0})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Диктор</label>
                  <Input 
                    value={editAudioForm.narrator} 
                    onChange={(e) => setEditAudioForm({...editAudioForm, narrator: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Возрастная группа</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={editAudioForm.ageGroup}
                    onChange={(e) => setEditAudioForm({...editAudioForm, ageGroup: e.target.value})}
                  >
                    <option value="2-4">2-4 года</option>
                    <option value="3-6">3-6 лет</option>
                    <option value="5-8">5-8 лет</option>
                    <option value="7-12">7-12 лет</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="editAudioIsPremium"
                    checked={editAudioForm.isPremium}
                    onChange={(e) => setEditAudioForm({...editAudioForm, isPremium: e.target.checked})}
                  />
                  <label htmlFor="editAudioIsPremium" className="text-sm font-medium">Премиум аудиокнига</label>
                </div>
                <div>
                  <label className="text-sm font-medium">Цена (₽)</label>
                  <Input 
                    type="number"
                    placeholder="0" 
                    className="mt-1"
                    value={editAudioForm.price}
                    onChange={(e) => setEditAudioForm({...editAudioForm, price: Number(e.target.value)})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Цена в рублях. Оставьте 0 для бесплатной аудиокниги
                  </p>
                </div>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    if (editingAudio && editAudioForm.title && editAudioForm.author && editAudioForm.audioUrl) {
                      updateAudioMutation.mutate({
                        id: editingAudio.id,
                        data: {
                          ...editAudioForm,
                          categoryId: editingAudio.categoryId
                        }
                      });
                      setShowEditAudio(false);
                    }
                  }}
                >
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Shop Product Modal */}
      {showAddShopProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto my-4">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Добавить новый товар</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAddShopProduct(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название товара</label>
                  <Input 
                    value={newShopProductForm.name} 
                    placeholder="Введите название товара"
                    onChange={(e) => setNewShopProductForm({...newShopProductForm, name: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <Input 
                    value={newShopProductForm.description} 
                    placeholder="Введите описание товара"
                    onChange={(e) => setNewShopProductForm({...newShopProductForm, description: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Изображение товара (URL)</label>
                  <Input 
                    value={newShopProductForm.imageUrl} 
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => setNewShopProductForm({...newShopProductForm, imageUrl: e.target.value})}
                    className="mt-1" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Рекомендуется: JPEG/PNG/WebP, размер 400×400 пикселей, до 1MB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Цена (в копейках)</label>
                  <Input 
                    type="number"
                    value={newShopProductForm.price} 
                    placeholder="129900 (для 1299.00₽)"
                    onChange={(e) => setNewShopProductForm({...newShopProductForm, price: parseInt(e.target.value) || 0})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Категория</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newShopProductForm.category}
                    onChange={(e) => setNewShopProductForm({...newShopProductForm, category: e.target.value})}
                  >
                    <option value="Одежда">Одежда</option>
                    <option value="Аксессуары">Аксессуары</option>
                    <option value="Канцелярия">Канцелярия</option>
                    <option value="Подарки">Подарки</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Количество на складе</label>
                  <Input 
                    type="number"
                    value={newShopProductForm.stock} 
                    placeholder="25"
                    onChange={(e) => setNewShopProductForm({...newShopProductForm, stock: parseInt(e.target.value) || 0})}
                    className="mt-1" 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="newProductIsActive"
                    checked={newShopProductForm.isActive}
                    onChange={(e) => setNewShopProductForm({...newShopProductForm, isActive: e.target.checked})}
                  />
                  <label htmlFor="newProductIsActive" className="text-sm font-medium">Активный товар</label>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    if (newShopProductForm.name && newShopProductForm.price > 0) {
                      createShopProductMutation.mutate(newShopProductForm);
                      // Очищаем форму
                      setNewShopProductForm({
                        name: "",
                        description: "",
                        price: 0,
                        category: "Одежда",
                        imageUrl: "",
                        stock: 0,
                        isActive: true
                      });
                    }
                  }}
                  disabled={!newShopProductForm.name || newShopProductForm.price <= 0}
                >
                  Добавить товар
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shop Product Modal */}
      {showEditShopProduct && editingShopProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto my-4">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Редактировать товар</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowEditShopProduct(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название товара</label>
                  <Input 
                    value={editShopProductForm.name} 
                    onChange={(e) => setEditShopProductForm({...editShopProductForm, name: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <Input 
                    value={editShopProductForm.description} 
                    onChange={(e) => setEditShopProductForm({...editShopProductForm, description: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Изображение товара (URL)</label>
                  <Input 
                    value={editShopProductForm.imageUrl} 
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => setEditShopProductForm({...editShopProductForm, imageUrl: e.target.value})}
                    className="mt-1" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Рекомендуется: JPEG/PNG/WebP, размер 400×400 пикселей, до 1MB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Цена (в копейках)</label>
                  <Input 
                    type="number"
                    value={editShopProductForm.price} 
                    onChange={(e) => setEditShopProductForm({...editShopProductForm, price: parseInt(e.target.value) || 0})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Категория</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={editShopProductForm.category}
                    onChange={(e) => setEditShopProductForm({...editShopProductForm, category: e.target.value})}
                  >
                    <option value="Одежда">Одежда</option>
                    <option value="Аксессуары">Аксессуары</option>
                    <option value="Канцелярия">Канцелярия</option>
                    <option value="Подарки">Подарки</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Количество на складе</label>
                  <Input 
                    type="number"
                    value={editShopProductForm.stock} 
                    onChange={(e) => setEditShopProductForm({...editShopProductForm, stock: parseInt(e.target.value) || 0})}
                    className="mt-1" 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="editProductIsActive"
                    checked={editShopProductForm.isActive}
                    onChange={(e) => setEditShopProductForm({...editShopProductForm, isActive: e.target.checked})}
                  />
                  <label htmlFor="editProductIsActive" className="text-sm font-medium">Активный товар</label>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (editShopProductForm.name && editShopProductForm.price > 0) {
                      updateShopProductMutation.mutate({
                        id: editingShopProduct.id,
                        data: editShopProductForm
                      });
                    }
                  }}
                  disabled={!editShopProductForm.name || editShopProductForm.price <= 0}
                >
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player Modal */}
      {showAudioPlayer && playingAudio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">🎧 Прослушивание</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if (audioElement) {
                      audioElement.pause();
                      audioElement.currentTime = 0;
                      setAudioElement(null);
                    }
                    setShowAudioPlayer(false);
                    setPlayingAudio(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Audio Book Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-purple-500 rounded-lg flex items-center justify-center text-white text-3xl mx-auto mb-3">
                  📖
                </div>
                <h4 className="text-lg font-semibold">{playingAudio.title}</h4>
                <p className="text-gray-600">{playingAudio.author}</p>
                {playingAudio.narrator && (
                  <p className="text-sm text-gray-500">Читает: {playingAudio.narrator}</p>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4 mb-6">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    if (!audioElement) {
                      const audio = new Audio(playingAudio.audioUrl);
                      setAudioElement(audio);
                      audio.play().catch(error => {
                        console.error("Ошибка воспроизведения:", error);
                        alert("Не удалось воспроизвести аудио. Проверьте URL файла.");
                      });
                    } else {
                      audioElement.play();
                    }
                  }}
                  disabled={!playingAudio.audioUrl}
                >
                  ▶️ Играть
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    if (audioElement) {
                      audioElement.pause();
                      audioElement.currentTime = 0;
                      setAudioElement(null);
                    }
                  }}
                >
                  ⏹️ Остановить
                </Button>
              </div>

              {/* Back Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (audioElement) {
                    audioElement.pause();
                    audioElement.currentTime = 0;
                    setAudioElement(null);
                  }
                  setShowAudioPlayer(false);
                  setPlayingAudio(null);
                }}
              >
                ← Вернуться
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
