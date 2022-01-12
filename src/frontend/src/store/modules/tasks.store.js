import {
  SET_ENTITY,
  ADD_ENTITY,
  UPDATE_ENTITY,
  DELETE_ENTITY,
  UPDATE_FILTERS
} from '@/store/mutations-types';
import { capitalize, normalizeTask } from '@/common/helpers';
import jsonTasks from '@/static/tasks.json';

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
    query({ commit }) {
      const data = jsonTasks.map(task => normalizeTask(task));
      commit(
        SET_ENTITY,
        {
          ...namespace,
          value: data
        }, { root: true }
      );
    },

    post({ state, commit, rootState }, task) {
      const id = state.tasks.length + 1;
      const newTask = normalizeTask({
        ...task,
        ticks: [],
        id
      });
      if (newTask.userId) {
        const taskUser = rootState.users
          .find(({ id }) => id === newTask.userId);
        newTask.user = taskUser || null;
      }
      commit(ADD_ENTITY,
        {
          ...namespace,
          value: newTask
        }, { root: true }
      );
      return newTask;
    },

    put({ commit, rootState }, task) {
      const { status, timeStatus, user, ...result } = task;

      const newTask = normalizeTask({
        ...result,
        ticks: result.ticks || []
      });

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

    delete({ commit }, id) {
      // TODO: Add api call
      commit(DELETE_ENTITY,
        {
          ...namespace,
          id
        }, { root: true }
      );
    }
  }
};
