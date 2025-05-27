const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Demo data for RIZY LAND
const categories = [
  { id: 1, name: 'Сказки', description: 'Волшебные истории для детей', icon: '🧚‍♀️' },
  { id: 2, name: 'Приключения', description: 'Захватывающие путешествия', icon: '🗺️' },
  { id: 3, name: 'Обучение', description: 'Познавательные книги', icon: '📚' },
  { id: 4, name: 'Стихи', description: 'Детские стихотворения', icon: '🎵' }
];

const books = [
  {
    id: 1,
    title: 'Колобок',
    author: 'Народная сказка',
    description: 'Классическая русская народная сказка о приключениях Колобка.',
    coverImage: '/images/kolobok.jpg',
    content: 'Жили-были старик со старухой. Попросил старик испечь колобок...',
    categoryId: 1,
    ageGroup: '3-6',
    isPremium: false,
    price: 0,
    readingTime: 5
  },
  {
    id: 2,
    title: 'Три поросёнка',
    author: 'Народная сказка',
    description: 'История о трёх поросятах и сером волке.',
    coverImage: '/images/three-pigs.jpg',
    content: 'Жили-были три поросёнка. Звали их Ниф-Ниф, Нуф-Нуф и Наф-Наф...',
    categoryId: 1,
    ageGroup: '3-8',
    isPremium: false,
    price: 0,
    readingTime: 8
  },
  {
    id: 3,
    title: 'Алиса в стране чудес',
    author: 'Льюис Кэрролл',
    description: 'Невероятные приключения Алисы в волшебной стране.',
    coverImage: '/images/alice.jpg',
    content: 'Алиса сидела со старшей сестрой на берегу и очень скучала...',
    categoryId: 2,
    ageGroup: '6-12',
    isPremium: true,
    price: 199,
    readingTime: 45
  }
];

const audioBooks = [
  {
    id: 1,
    title: 'Курочка Ряба',
    author: 'Народная сказка',
    description: 'Аудиосказка о курочке, которая снесла золотое яичко.',
    coverImage: '/images/ryaba.jpg',
    audioUrl: '/audio/ryaba.mp3',
    duration: 180,
    categoryId: 1,
    ageGroup: '2-5',
    isPremium: false,
    price: 0,
    narrator: 'Анна Петрова'
  },
  {
    id: 2,
    title: 'Репка',
    author: 'Народная сказка',
    description: 'Музыкальная сказка о большой-пребольшой репке.',
    coverImage: '/images/repka.jpg',
    audioUrl: '/audio/repka.mp3',
    duration: 240,
    categoryId: 1,
    ageGroup: '2-6',
    isPremium: false,
    price: 0,
    narrator: 'Василий Сидоров'
  }
];

const shopProducts = [
  {
    id: 1,
    name: 'Книжка-раскраска "Сказочные герои"',
    description: 'Красочная раскраска с любимыми персонажами',
    price: 299,
    category: 'Творчество',
    imageUrl: '/images/coloring-book.jpg',
    stock: 50
  },
  {
    id: 2,
    name: 'Плюшевый Колобок',
    description: 'Мягкая игрушка главного героя сказки',
    price: 899,
    category: 'Игрушки',
    imageUrl: '/images/kolobok-toy.jpg',
    stock: 25
  },
  {
    id: 3,
    name: 'Набор магнитов "Три поросёнка"',
    description: 'Магниты на холодильник с героями сказки',
    price: 399,
    category: 'Сувениры',
    imageUrl: '/images/magnets.jpg',
    stock: 100
  }
];

// API Routes
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/books', (req, res) => {
  const { categoryId, isPremium } = req.query;
  let filteredBooks = books;
  
  if (categoryId) {
    filteredBooks = filteredBooks.filter(book => book.categoryId == categoryId);
  }
  
  if (isPremium !== undefined) {
    filteredBooks = filteredBooks.filter(book => book.isPremium == (isPremium === 'true'));
  }
  
  res.json(filteredBooks);
});

app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id == req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

app.get('/api/audiobooks', (req, res) => {
  const { categoryId, isPremium } = req.query;
  let filteredAudioBooks = audioBooks;
  
  if (categoryId) {
    filteredAudioBooks = filteredAudioBooks.filter(book => book.categoryId == categoryId);
  }
  
  if (isPremium !== undefined) {
    filteredAudioBooks = filteredAudioBooks.filter(book => book.isPremium == (isPremium === 'true'));
  }
  
  res.json(filteredAudioBooks);
});

app.get('/api/audiobooks/:id', (req, res) => {
  const audioBook = audioBooks.find(b => b.id == req.params.id);
  if (!audioBook) {
    return res.status(404).json({ error: 'AudioBook not found' });
  }
  res.json(audioBook);
});

app.get('/api/shop', (req, res) => {
  res.json(shopProducts);
});

app.get('/api/shop/:id', (req, res) => {
  const product = shopProducts.find(p => p.id == req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Search functionality
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ books: [], audioBooks: [] });
  }
  
  const query = q.toLowerCase();
  const searchBooks = books.filter(book => 
    book.title.toLowerCase().includes(query) || 
    book.author.toLowerCase().includes(query) ||
    book.description.toLowerCase().includes(query)
  );
  
  const searchAudioBooks = audioBooks.filter(book => 
    book.title.toLowerCase().includes(query) || 
    book.author.toLowerCase().includes(query) ||
    book.description.toLowerCase().includes(query)
  );
  
  res.json({ books: searchBooks, audioBooks: searchAudioBooks });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RIZY LAND Server running on port ${PORT}`);
  console.log(`📚 Books API: http://localhost:${PORT}/api/books`);
  console.log(`🎧 AudioBooks API: http://localhost:${PORT}/api/audiobooks`);
  console.log(`🛍️ Shop API: http://localhost:${PORT}/api/shop`);
});