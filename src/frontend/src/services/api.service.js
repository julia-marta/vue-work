import JwtService from '@/services/jwt.service';
import taskStatuses from '@/common/enums/taskStatuses';
import timeStatuses from '@/common/enums/timeStatuses';
import { DAY_IN_MILLISEC } from '@/common/constants';
import axios from '@/plugins/axios';

class BaseApiService {
  constructor(notifier) {
    if (!axios.$notifier) {
      axios.$notifier = notifier;
    }
  }
}

// наследуемся от BaseApiService, так как класс не подразумевает CRUD операции
export class AuthApiService extends BaseApiService {
  constructor(notifier) {
    // передаём notifier для использования в родительском конструкторе
    super(notifier);
  }

  // задаём токен авторизации
  setAuthHeader() {
    // получаем токен из LocalStorage с помощью JWT-сервиса
    const token = JwtService.getToken();
    // добавляем заголовок авторизации в axios как Bearer token
    axios.defaults.headers.common['Authorization'] = token
      ? `Bearer ${token}`
      : '';
  }

  async login(params) {
    // отправляем логин/пароль для авторизации на сервере
    const { data } = await axios.post('login', params);
    return data;
  }

  async logout() {
    // делаем логаут на сервере
    const { data } = await axios.delete('logout');
    return data;
  }

  async getMe() {
    // получаем профиль залогиненного пользователя
    const { data } = await axios.get('whoAmI');
    return data;
  }
}

export class ReadOnlyApiService extends BaseApiService {
  // resource — приватное свойство класса. Добавляем его к базовому URL, чтобы
  // получить финальный URL, на который нужно отправлять запросы
  #resource;
  constructor(resource, notifier) {
    super(notifier);
    this.#resource = resource;
  }

  // запрос на получение списка сущностей
  async query(config = {}) {
    const { data } = await axios.get(this.#resource, config);
    return data;
  }

  // запрос на получение одной сущности по id
  async get(id, config = {}) {
    const { data } = await axios.get(`${this.#resource}/${id}`, config);
    return data;
  }
}

// Наследуемся от Read-only API-сервиса и добавляем операции post, put, delete
export class CrudApiService extends ReadOnlyApiService {
  #resource;
  constructor(resource, notifier) {
    super(resource, notifier);
    this.#resource = resource;
  }

  // запрос на создание сущности
  async post(entity) {
    const { data } = await axios.post(this.#resource, entity);
    return data;
  }

  // запрос на обновление сущности
  async put(entity) {
    const { data } = await axios.put(
      `${this.#resource}/${entity.id}`,
      entity
    );
    return data;
  }

  // запрос на удаление сущности
  async delete(id) {
    const { data } = await axios.delete(`${this.#resource}/${id}`);
    return data;
  }
}

// Наследуемся от CRUD API-сервиса
export class TaskApiService extends CrudApiService {
  constructor(notifier) {
    super('tasks', notifier);
  }

  // метод для получения time status на основании dueDate (дата дедлайна)
  static getTimeStatus(dueDate) {
    if (!dueDate) {
      return '';
    }
    const currentTime = +new Date();
    const taskTime = Date.parse(dueDate);
    const timeDelta = taskTime - currentTime;
    if (timeDelta > DAY_IN_MILLISEC) {
      return '';
    }
    return timeDelta < 0 ? timeStatuses.deadline : timeStatuses.expired;
  }

  // Нормализация задачи, полученной с сервера
  _normalize(task) {
    return {
      ...task,
      ticks: task.ticks ? task.ticks : [],
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      status: task.statusId ? taskStatuses[task.statusId] : '',
      timeStatus: TaskApiService.getTimeStatus(task.dueDate)
    };
  }

  // Форматирование данных перед отправкой на сервер (убираем лишнее)
  _createRequest(task) {
    const { ticks, comments, status, timeStatus, user, ...request } = task;
    return request;
  }

  // Получение списка задач
  async query(config = {}) {
    const tasks = await super.query(config);
    return tasks.map(task => this._normalize(task));
  }

  // Получение 1 задачи по id
  async get(id, config = {}) {
    const data = await super.get(id, config);
    return this._normalize(data);
  }

  // Создание новой задачи
  async post(task) {
    const newTask = await super.post(this._createRequest(task));
    return this._normalize(newTask);
  }

  // Обновление 1 задачи
  async put(task) {
    await super.put(this._createRequest(task));
    return this._normalize(task);
  }
}
