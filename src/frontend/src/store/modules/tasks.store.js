import {
  SET_ENTITY,
  ADD_ENTITY,
  UPDATE_ENTITY,
  DELETE_ENTITY,
  UPDATE_FILTERS
} from '@/store/mutations-types';
import { cloneDeep } from 'lodash';
import { capitalize } from '@/common/helpers';

const entity = 'tasks';
const module = capitalize(entity);
const namespace = { entity, module };

export default {
  namespaced: true,
  state: {
    tasks: [],
    filters: {
      search: '',
      users: [],
      statuses: []
    }
  },

  getters: {
    // первый параметр геттера — state
    // делаем деструктуризацию и получаем из него фильтры и задачи
    filteredTasks({ filters, tasks }) {
    // если фильтры не заданы, то возвращаем полный список задач
      const filtersAreEmpty = Object.values(filters)
        .every(value => !value.length);
      if (filtersAreEmpty) {
      // примечание: чтобы избежать фильтрации задач, если фильтр не установлен
        return tasks;
      }

      // функция для фильтрации задач по поиску
      const searchFilter = task => task.title
        .toLowerCase()
        .includes(filters.search.toLowerCase().trim());

      // функция для фильтрации задач по выбранным пользователям
      const usersFilter = task => filters.users
        .some(userId => userId === task.userId);

      // функция для фильтрации задач по выбранным статусам
      const statusesFilter = task => filters.statuses
        .some(el => el === task.status || el === task.timeStatus);

      // объединяем функции фильтрации в объект коллбеков
      // и если задача выполняет каждого из них, она попадает
      // в результирующий список (либо такой фильтр вообще отсутствует)
      return tasks.filter(task => {
        let result = {
          search: searchFilter,
          users: usersFilter,
          statuses: statusesFilter
        };
        return Object.entries(result)
          .every(([key, callback]) => !filters[key].length || callback(task));
      });
    },
    // количество задач в сайдбаре
    sidebarTasksCount:
      state => state.tasks.filter(({ columnId }) => !columnId).length,
    // поиск задачи по айди
    getTaskById: state => id => state.tasks.find(task => +task.id === +id)
  },

  mutations: {
    [UPDATE_FILTERS](state, filter) {
      state.filters = { ...state.filters, ...filter };
    }
  },

  actions: {
    // Получаем список задач
    async query({ commit }, config) {
      const data = await this.$api.tasks.query(config);

      commit(
        SET_ENTITY,
        {
          ...namespace,
          value: data
        }, { root: true }
      );
    },

    // отправляем запрос на сохранение новой задачи
    async post({ commit }, task) {
      const taskCopy = cloneDeep(task);
      const data = await this.$api.tasks.post(taskCopy);

      commit(ADD_ENTITY,
        {
          ...namespace,
          value: data
        }, { root: true }
      );
      return data;
    },

    // Отправляем запрос на обновление задачи
    async put({ commit, rootState }, task) {
    // Мутация перед запросом - для плавного drag-n-drop перетаскивания
      commit(UPDATE_ENTITY,
        {
          ...namespace,
          value: task
        }, { root: true }
      );

      const newTask = await this.$api.tasks.put(task);

      if (newTask.userId) {
        const taskUser = rootState.users
          .find(({ id }) => id === newTask.userId);
        newTask.user = taskUser || null;
      }

      // Note: confirm update
      commit(UPDATE_ENTITY,
        {
          ...namespace,
          value: newTask
        }, { root: true }
      );
    },

    // Отправляем запрос на удаление задачи
    async delete({ commit }, id) {
      await this.$api.tasks.delete(id);

      commit(DELETE_ENTITY,
        {
          ...namespace,
          id
        }, { root: true }
      );
    }
  }
};
