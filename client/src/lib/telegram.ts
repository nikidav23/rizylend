interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  viewportHeight: number;
  viewportStableHeight: number;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  MainButton: {
    show(): void;
    hide(): void;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  sendData(data: string): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  showPopup(params: { title?: string; message: string; buttons?: Array<{id?: string; type?: string; text: string}> }, callback?: (button_id: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const tg = window.Telegram?.WebApp;

export const initTelegramApp = () => {
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0536d4');
    tg.setBackgroundColor('#ffffff');
    
    // Адаптируем размеры для Telegram Mini App
    if (tg.viewportHeight) {
      document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
    }
    
    // Настраиваем тему в соответствии с Telegram
    if (tg.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    // Отключаем подтверждение закрытия для лучшего UX
    tg.disableClosingConfirmation();
  }
};

export const getTelegramUser = () => {
  return tg?.initDataUnsafe?.user;
};

export const hapticFeedback = {
  light: () => tg?.HapticFeedback.impactOccurred('light'),
  medium: () => tg?.HapticFeedback.impactOccurred('medium'),
  heavy: () => tg?.HapticFeedback.impactOccurred('heavy'),
  success: () => tg?.HapticFeedback.notificationOccurred('success'),
  error: () => tg?.HapticFeedback.notificationOccurred('error'),
  warning: () => tg?.HapticFeedback.notificationOccurred('warning'),
  selection: () => tg?.HapticFeedback.selectionChanged(),
};

export const showMainButton = (text: string, callback: () => void) => {
  if (tg) {
    tg.MainButton.setText(text);
    tg.MainButton.onClick(callback);
    tg.MainButton.show();
  }
};

export const hideMainButton = () => {
  if (tg) {
    tg.MainButton.hide();
  }
};

// Функции для работы с платежами через Telegram
export const showTelegramAlert = (message: string, callback?: () => void) => {
  if (tg) {
    tg.showAlert(message, callback);
  } else {
    alert(message);
    callback?.();
  }
};

export const showTelegramConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
  if (tg) {
    tg.showConfirm(message, callback);
  } else {
    const result = confirm(message);
    callback?.(result);
  }
};

export const sendDataToTelegram = (data: any) => {
  if (tg) {
    tg.sendData(JSON.stringify(data));
  }
};

export const openTelegramLink = (url: string) => {
  if (tg) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
};

// Функция для обработки покупок через Telegram Payments
export const processTelegramPayment = (bookId: number, price: number, title: string) => {
  const paymentData = {
    action: 'purchase',
    bookId,
    price,
    title,
    timestamp: Date.now()
  };
  
  sendDataToTelegram(paymentData);
};
