<template>
  <TaskCardCreator
    v-if="task"
    :task-to-edit="task"
  />
</template>

<script>
import TaskCardCreator from '@/modules/tasks/components/TaskCardCreator';
import { TASK_DETAILS_CONFIG } from '@/common/queryConfig';
import { auth, isAdmin } from '@/middlewares';

export default {
  name: 'TaskEdit',
  middlewares: [auth, isAdmin],
  components: { TaskCardCreator },
  data() {
    return {
      task: null
    };
  },
  // Раньше мы получали задачу из списка задач по id.
  // Ещё здесь же мы делали нормализацию.
  // Теперь мы получаем задачу с сервера.
  // Нормализация происходит на уровне API-сервиса.
  // Оборачиваем запрос в try/catch, и в случае ошибки возвращаем пользователя
  // на предыдущую страницу.
  async created() {
    try {
      this.task = await this.$api.tasks.get(
        this.$route.params.id, TASK_DETAILS_CONFIG
      );
    } catch {
      this.$router.go(-1);
    }
  }
};
</script>
