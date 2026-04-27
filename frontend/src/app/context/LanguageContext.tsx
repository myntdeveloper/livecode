import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ru";

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

const translations: Translations = {
  // Landing
  "hero.title": {
    en: "Write code together in real-time",
    ru: "Пиши код вместе в реальном времени",
  },
  "hero.subtitle": {
    en: "Create a room and share the link",
    ru: "Создай комнату и поделись ссылкой",
  },
  "button.createRoom": {
    en: "Create Room",
    ru: "Создать комнату",
  },
  "button.join": {
    en: "Join",
    ru: "Войти",
  },
  "input.roomPlaceholder": {
    en: "Paste link or room ID",
    ru: "Вставь ссылку или ID комнаты",
  },
  "feature.realtime": {
    en: "Real-time collaborative editing",
    ru: "Realtime совместное редактирование",
  },
  "feature.realtimeDesc": {
    en: "Changes sync instantly between all participants",
    ru: "Изменения синхронизируются мгновенно между всеми участниками",
  },
  "feature.cursors": {
    en: "Visible user cursors",
    ru: "Видимые курсоры пользователей",
  },
  "feature.cursorsDesc": {
    en: "See where other participants are in the code",
    ru: "Видь где находятся другие участники в коде",
  },
  "feature.languages": {
    en: "Language support",
    ru: "Поддержка языков",
  },
  "feature.languagesDesc": {
    en: "JavaScript, Python, Go, Rust and many more",
    ru: "JavaScript, Python, Go, Rust и многие другие",
  },
  "feature.sandbox": {
    en: "Run code in sandbox",
    ru: "Запуск кода в песочнице",
  },
  "feature.sandboxDesc": {
    en: "Execute code safely right in the browser",
    ru: "Выполняй код безопасно прямо в браузере",
  },
  "footer.text": {
    en: "Livecode — write code together",
    ru: "Livecode — пишем код вместе",
  },
  "hero.badge": {
    en: "Collaborative Coding Platform",
    ru: "Платформа для совместного программирования",
  },
  "landing.profile": {
    en: "Profile",
    ru: "Профиль",
  },
  // Room
  "room.label": {
    en: "Room",
    ru: "Комната",
  },
  "room.language": {
    en: "Language",
    ru: "Язык",
  },
  "room.participants": {
    en: "Participants",
    ru: "Участники",
  },
  "room.output": {
    en: "Output",
    ru: "Вывод",
  },
  "room.run": {
    en: "Run",
    ru: "Запустить",
  },
  "room.runPlaceholder": {
    en: "Press 'Run' to execute code",
    ru: "Нажми 'Запустить' для выполнения",
  },
  "room.settings": {
    en: "Settings",
    ru: "Настройки",
  },
  "room.terminalPosition": {
    en: "Terminal position",
    ru: "Позиция терминала",
  },
  "room.terminalRight": {
    en: "Right side",
    ru: "Справа",
  },
  "room.terminalBottom": {
    en: "Bottom",
    ru: "Снизу",
  },
  "room.kickTitle": {
    en: "Kick participant",
    ru: "Исключить участника",
  },
  "room.kickConfirm": {
    en: "Do you want to kick",
    ru: "Вы хотите исключить",
  },
  "room.kickAction": {
    en: "Kick",
    ru: "Исключить",
  },
  "room.theme": {
    en: "Theme",
    ru: "Тема",
  },
  "room.endSession": {
    en: "End session",
    ru: "Завершить сессию",
  },
  "room.endSessionConfirm": {
    en: "Do you really want to end your current session?",
    ru: "Вы точно хотите завершить текущую сессию?",
  },
  "room.endSessionAction": {
    en: "End session",
    ru: "Завершить",
  },
  "room.notFoundTitle": {
    en: "Room not found",
    ru: "Комната не найдена",
  },
  "room.notFoundDescription": {
    en: "This room does not exist or was removed.",
    ru: "Такой комнаты не существует или она была удалена.",
  },
  "room.closedTitle": {
    en: "Room is closed",
    ru: "Комната закрыта",
  },
  "room.closedDescription": {
    en: "The lobby owner has closed this room.",
    ru: "Владелец лобби закрыл эту комнату.",
  },
  "room.closeLobby": {
    en: "Close lobby?",
    ru: "Закрыть лобби?",
  },
  "room.closeLobbyConfirm": {
    en: "Do you really want to close this lobby for all participants?",
    ru: "Точно закрыть это лобби для всех участников?",
  },
  "room.closeLobbyAction": {
    en: "Close lobby",
    ru: "Закрыть лобби",
  },
  // Modal
  "modal.enterName": {
    en: "Enter your name",
    ru: "Введите ваше имя",
  },
  "modal.namePlaceholder": {
    en: "Your name",
    ru: "Ваше имя",
  },
  "modal.continue": {
    en: "Continue",
    ru: "Продолжить",
  },
  "modal.changeName": {
    en: "Change name",
    ru: "Изменить имя",
  },
  "modal.save": {
    en: "Save",
    ru: "Сохранить",
  },
  // Auth
  "auth.title": {
    en: "Sign in to continue",
    ru: "Войдите, чтобы продолжить",
  },
  "auth.welcomeTitle": {
    en: "Collaborate and code together in one room",
    ru: "Кодьте вместе в одной комнате",
  },
  "auth.welcomeSubtitle": {
    en: "Create and join coding sessions with real-time editing and fast sharing.",
    ru: "Создавайте и подключайтесь к сессиям с совместным редактированием в реальном времени.",
  },
  "auth.subtitle": {
    en: "Choose an authorization method to access the lobby",
    ru: "Выберите способ авторизации, чтобы попасть в лобби",
  },
  "auth.github": {
    en: "Continue with GitHub",
    ru: "Войти через GitHub",
  },
  "auth.loginButton": {
    en: "Login",
    ru: "Войти",
  },
  "auth.githubOnlyHint": {
    en: "Sign in is available only with GitHub",
    ru: "Вход доступен только через GitHub",
  },
  "auth.loading": {
    en: "Signing in...",
    ru: "Выполняем вход...",
  },
  "auth.mockHint": {
    en: "Temporary stub authorization. Real backend integration can be added later.",
    ru: "Временная заглушка авторизации. Реальную интеграцию с бэкендом можно добавить позже.",
  },
  // Not found
  "notFound.title": {
    en: "Page not found",
    ru: "Страница не найдена",
  },
  "notFound.backHome": {
    en: "Back to home",
    ru: "Вернуться на главную",
  },
  // Common language labels
  "language.english": {
    en: "English",
    ru: "English",
  },
  "language.russian": {
    en: "Russian",
    ru: "Русский",
  },
  // Route error
  "error.genericTitle": {
    en: "Something went wrong",
    ru: "Что-то пошло не так",
  },
  "error.genericDescription": {
    en: "An unexpected error occurred while loading this page.",
    ru: "Произошла непредвиденная ошибка при загрузке страницы.",
  },
  "error.notLoadedDescription": {
    en: "The requested page could not be loaded.",
    ru: "Не удалось загрузить запрошенную страницу.",
  },
  "error.goHome": {
    en: "Go to home",
    ru: "На главную",
  },
  "error.reload": {
    en: "Reload page",
    ru: "Перезагрузить страницу",
  },
  // Profile
  "profile.back": {
    en: "Back",
    ru: "Назад",
  },
  "profile.title": {
    en: "Profile Settings",
    ru: "Настройки профиля",
  },
  "profile.subtitle": {
    en: "Manage your profile information",
    ru: "Управляйте информацией своего профиля",
  },
  "profile.uploadAvatar": {
    en: "Upload Avatar",
    ru: "Загрузить аватар",
  },
  "profile.avatarHint": {
    en: "JPG, PNG or GIF (max. 2MB)",
    ru: "JPG, PNG или GIF (до 2MB)",
  },
  "profile.firstName": {
    en: "First Name",
    ru: "Имя",
  },
  "profile.lastName": {
    en: "Last Name",
    ru: "Фамилия",
  },
  "profile.username": {
    en: "Username",
    ru: "Имя пользователя",
  },
  "profile.saveChanges": {
    en: "Save Changes",
    ru: "Сохранить изменения",
  },
  "profile.logout": {
    en: "Log out",
    ru: "Выйти",
  },
  "profile.avatarLocked": {
    en: "Avatar and username are managed by GitHub authorization.",
    ru: "Аватар и логин управляются через авторизацию GitHub.",
  },
  "common.cancel": {
    en: "Cancel",
    ru: "Отмена",
  },
  "common.loading": {
    en: "Loading...",
    ru: "Загрузка...",
  },
  "room.endRoomSessionStub": {
    en: "The end session function is not yet available. You will be redirected to home.",
    ru: "Функция завершения сессии комнаты пока недоступна. Вы будете возвращены на главную.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
