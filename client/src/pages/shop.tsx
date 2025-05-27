import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Filter, ShoppingCart, X } from "lucide-react";
import { initTelegramApp, hapticFeedback, processTelegramPayment, showTelegramAlert } from "@/lib/telegram";
import { useQuery } from "@tanstack/react-query";
import type { ShopProduct } from "@shared/schema";

const categories = ["Все", "Одежда", "Аксессуары", "Канцелярия", "Подарки"];

// Компонент для отображения иконки товара
const ProductIcon = ({ category, name }: { category: string; name: string }) => {
  const getIconAndColor = () => {
    if (name.toLowerCase().includes('футболка')) {
      return { icon: '👕', color: 'bg-blue-500' };
    } else if (name.toLowerCase().includes('худи')) {
      return { icon: '🧥', color: 'bg-green-500' };
    } else if (name.toLowerCase().includes('закладка')) {
      return { icon: '🔖', color: 'bg-red-500' };
    } else if (name.toLowerCase().includes('блокнот')) {
      return { icon: '📖', color: 'bg-purple-500' };
    } else if (name.toLowerCase().includes('кружка')) {
      return { icon: '☕', color: 'bg-orange-500' };
    } else if (name.toLowerCase().includes('рюкзак')) {
      return { icon: '🎒', color: 'bg-cyan-500' };
    } else {
      // Иконки по категориям как резерв
      switch (category) {
        case 'Одежда': return { icon: '👕', color: 'bg-blue-500' };
        case 'Аксессуары': return { icon: '🎒', color: 'bg-cyan-500' };
        case 'Канцелярия': return { icon: '📝', color: 'bg-purple-500' };
        case 'Подарки': return { icon: '🎁', color: 'bg-pink-500' };
        default: return { icon: '🛍️', color: 'bg-gray-500' };
      }
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <div className={`w-full h-40 ${color} rounded-lg flex items-center justify-center text-4xl text-white`}>
      {icon}
    </div>
  );
};

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);

  // Временные товары для отображения
  const tempProducts: ShopProduct[] = [
    {
      id: 1,
      name: "Футболка RIZY LAND детская",
      description: "Мягкая хлопковая футболка с логотипом RIZY LAND для юных читателей",
      price: 129900,
      category: "Одежда",
      imageUrl: "",
      stock: 50,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 2,
      name: "Худи RIZY LAND с капюшоном",
      description: "Уютное худи для детей с яркими принтами из любимых книг",
      price: 249900,
      category: "Одежда",
      imageUrl: "",
      stock: 30,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 3,
      name: "Закладка магнитная \"Колобок\"",
      description: "Красочная магнитная закладка с героями из популярной сказки",
      price: 19900,
      category: "Канцелярия",
      imageUrl: "",
      stock: 100,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 4,
      name: "Блокнот \"Мои истории\" A5",
      description: "Красивый блокнот для записей и рисунков с мотивами из детских книг",
      price: 79900,
      category: "Канцелярия",
      imageUrl: "",
      stock: 75,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 5,
      name: "Кружка \"Герои сказок\"",
      description: "Яркая детская кружка с любимыми персонажами из книг RIZY LAND",
      price: 69900,
      category: "Подарки",
      imageUrl: "",
      stock: 40,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 6,
      name: "Рюкзак детский \"Приключения\"",
      description: "Удобный рюкзак для школы и прогулок с яркими иллюстрациями",
      price: 189900,
      category: "Аксессуары",
      imageUrl: "",
      stock: 25,
      isActive: true,
      createdAt: new Date()
    }
  ];

  // Используем временные товары
  const products = tempProducts;
  const isLoading = false;

  useEffect(() => {
    initTelegramApp();
  }, []);

  const filteredProducts = products?.filter(product => 
    selectedCategory === "Все" || product.category === selectedCategory
  ) || [];

  const handleBuyProduct = (product: ShopProduct) => {
    hapticFeedback.light();
    setSelectedProduct(product);
    setShowPurchaseModal(true);
  };

  const handlePurchaseComplete = () => {
    if (selectedProduct) {
      // Инициируем платеж через Telegram
      processTelegramPayment(selectedProduct.id, selectedProduct.price, selectedProduct.name);
      
      // Показываем уведомление пользователю через Telegram
      showTelegramAlert(
        `Платеж на сумму ${selectedProduct.price}₽ за товар "${selectedProduct.name}" инициирован!`,
        () => {
          hapticFeedback.success();
          setShowPurchaseModal(false);
          setSelectedProduct(null);
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0536d4" }}>
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0536d4" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Магазин</h1>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Filter className="w-6 h-6" />
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(category);
                hapticFeedback.selection();
              }}
              className={`whitespace-nowrap ${
                selectedCategory === category 
                  ? "bg-white text-blue-600" 
                  : "bg-transparent text-white border-white/30 hover:bg-white/20"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-20">
        {filteredProducts.length === 0 ? (
          <div className="text-center text-white py-8">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Товары не найдены</p>
            <p className="text-sm opacity-75">Попробуйте выбрать другую категорию</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-white h-full">
                <CardContent className="p-4 h-full flex flex-col">
                  {/* Product Image/Icon */}
                  <ProductIcon category={product.category} name={product.name} />
                  
                  {/* Product Info */}
                  <div className="mt-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm leading-tight mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    <div className="space-y-1 mt-auto">
                      <span className="text-lg font-bold text-blue-600 block">
                        {(product.price / 100).toFixed(2)}₽
                      </span>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <Button
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                    onClick={() => handleBuyProduct(product)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Нет в наличии" : "Купить"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
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
                Купить товар
              </h2>
              
              <p className="text-center text-gray-600 mb-8">
                Добавить "{selectedProduct.name}" в корзину
              </p>

              {/* Price Options */}
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-gray-700">{selectedProduct.category}</span>
                  <span className="text-blue-500 font-bold text-lg">
                    {(selectedProduct.price / 100).toFixed(2)}₽
                  </span>
                </div>
                {selectedProduct.stock !== null && (
                  <div className="text-center text-sm text-gray-500">
                    {selectedProduct.stock > 0 ? `В наличии: ${selectedProduct.stock} шт.` : 'Нет в наличии'}
                  </div>
                )}
              </div>

              {/* Purchase Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3"
                  onClick={handlePurchaseComplete}
                  disabled={selectedProduct.stock === 0}
                >
                  {selectedProduct.stock === 0 ? 
                    'Нет в наличии' : 
                    `Купить за ${(selectedProduct.price / 100).toFixed(2)}₽`
                  }
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
    </div>
  );
}