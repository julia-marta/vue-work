import {
  UPDATE_ENTITY
} from '@/store/mutations-types';

export default {
  namespaced: true,
  actions: {
    // Отправляем запрос на добавление нового tick.
    async post({ commit, rootState }, tick) {
      const data = await this.$api.ticks.post(tick);

      // обновляем tick в объекте задачи
      const task = rootState.Tasks.tasks.find(({ id }) => id === tick.taskId);
      if (task) {
        if (Array.isArray(task.ticks)) {
          task.ticks = [...task.ticks, data];
        } else {
          task.ticks = [data];
        }
        commit(UPDATE_ENTITY,
          {
            module: 'Tasks',
            entity: 'tasks',
            value: task
          }, { root: true }
        );
      }
    },

    // Отправляем запрос на обновление tick
    async put({ commit, rootState }, tick) {
      await this.$api.ticks.put(tick);

      const task = rootState.Tasks.tasks.find(({ id }) => id === tick.taskId);

      if (task && task.ticks) {
        const index = task.ticks.findIndex(({ id }) => id === tick.id);
        if (index) {
          task.ticks.splice(index, 1, tick);
          commit(UPDATE_ENTITY,
            {
              module: 'Tasks',
              entity: 'tasks',
              value: task
            }, { root: true }
          );
        };
      }
    },

    // Отправляем запрос на удаление tick
    async delete({ commit }, id) {
      await this.$api.ticks.delete(id);
    }
  }
};
