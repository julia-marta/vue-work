import {
  MINUTE_IN_SEC,
  HOUR_IN_SEC,
  DAY_IN_SEC,
  MONTH_IN_SEC,
  YEAR_IN_SEC,
  TAG_SEPARATOR
} from '@/common/constants';
import resources from '@/common/enums/resources';
import {
  AuthApiService,
  CrudApiService,
  ReadOnlyApiService,
  TaskApiService
} from '@/services/api.service';
import users from '@/static/users';
import { SET_ENTITY } from '@/store/mutations-types';

// Преобразование первой буквы в заглавную

export const capitalize = string =>
  `${string.charAt(0).toUpperCase()}${string.slice(1)}`;

// установка авторизованного пользователя в хранилище
export const setAuth = store => {
  store.$api.auth.setAuthHeader();
  store.dispatch('Auth/getMe');
};

// Получение тегов из строки тегов.

export const getTagsArrayFromString = tags => {
  const array = tags.split(TAG_SEPARATOR);
  return array.slice(1, array.length);
};

// Получение даты в читабельном формате.

export const getReadableDate = date => {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const month = newDate.getMonth();
  const day = newDate.getDate();
  return `${day}.${month + 1}.${year}`;
};

// Получение времени в читабельном формате (аналог moment).

export const getTimeAgo = date => {
  if (!date) {
    return '... время не указано ...';
  }

  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / YEAR_IN_SEC;

  function getString(number, pronounce) {
    return `${number} ${pronounce} назад`;
  }

  function getPronounce(number, single, pluralTwoFour, pluralFive) {
    return number === 1
      ? single
      : number > 1 && number < 5
        ? pluralTwoFour
        : pluralFive;
  }

  if (interval > 1) {
    const number = Math.floor(interval);
    const pronounce = getPronounce(number, 'год', 'года', 'лет');
    return getString(number, pronounce);
  }

  interval = seconds / MONTH_IN_SEC;

  if (interval > 1) {
    const number = Math.floor(interval);
    const pronounce = getPronounce(number, 'месяц', 'месяца', 'месяцев');
    return getString(number, pronounce);
  }

  interval = seconds / DAY_IN_SEC;

  if (interval > 1) {
    const number = Math.floor(interval);
    const pronounce = getPronounce(number, 'день', 'дня', 'дней');
    return getString(number, pronounce);
  }

  interval = seconds / HOUR_IN_SEC;
  if (interval > 1) {
    const number = Math.floor(interval);
    const pronounce = getPronounce(number, 'час', 'часа', 'часов');
    return getString(number, pronounce);
  }

  interval = seconds / MINUTE_IN_SEC;
  if (interval > 1) {
    const number = Math.floor(interval);
    const pronounce = getPronounce(number, 'минуту', 'минуты', 'минут');
    return getString(number, pronounce);
  }
  return 'сейчас';
};

// Создание UUID

export const createUUIDv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Создание даты с временем

export const createNewDate = () => {
  return new Date(new Date().setHours(23,59,59,999));
};

// хелпер для создания экземпляров сервисов на основании ресурсов:

export const createResources = notifier => {
  return {
    [resources.USERS]:
      new ReadOnlyApiService(resources.USERS, notifier),
    [resources.AUTH]: new AuthApiService(notifier),
    [resources.TASKS]: new TaskApiService(notifier),
    [resources.COLUMNS]:
      new CrudApiService(resources.COLUMNS, notifier),
    [resources.TICKS]: new CrudApiService(resources.TICKS, notifier),
    [resources.COMMENTS]:
      new CrudApiService(resources.COMMENTS, notifier)
  };
};

// вспомогательный метод аутентификации пользователя для тестов

export const authenticateUser = store => {
  store.commit(SET_ENTITY, {
    module: 'Auth',
    entity: 'user',
    value: users[0]
  });
  store.commit(SET_ENTITY, {
    module: 'Auth',
    entity: 'isAuthenticated',
    value: true
  });
};
