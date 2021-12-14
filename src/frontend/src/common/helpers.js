import {
  DAY_IN_MILLISEC,
  TAG_SEPARATOR
} from '@/common/constants';
import { cloneDeep } from 'lodash';
import timeStatuses from '@/common/enums/timeStatuses';
import taskStatuses from '@/common/enums/taskStatuses';

// Получение тегов из строки тегов.

export const getTagsArrayFromString = tags => {
  const array = tags.split(TAG_SEPARATOR);
  return array.slice(1, array.length);
};

// Нормализация статуса по времени.

export const getTimeStatus = dueDate => {
  if (!dueDate) {
    return '';
  }
  const currentTime = +new Date();
  const taskTime = Date.parse(dueDate);
  const timeDelta = taskTime - currentTime;
  if (timeDelta > DAY_IN_MILLISEC) {
    return '';
  }
  return timeDelta < 0 ? timeStatuses.DEADLINE : timeStatuses.EXPIRED;
};

// Получение задач для определенной колонки.

export const getTargetColumnTasks = (toColumnId, tasks) => {
  return tasks.filter(task => task.columnId === toColumnId);
};

// Добавление таска при перетаскивании

export const addActive = (active, toTask, tasks) => {
  const activeClone = cloneDeep(active);
  const tasksClone = cloneDeep(tasks);
  const activeIndex = tasksClone.findIndex(task => task.id === active.id);
  if (~activeIndex) {
    tasksClone.splice(activeIndex, 1);
  }

  tasksClone.sort((a, b) => a.sortOrder - b.sortOrder);

  if (toTask) {
    const toTaskIndex = tasksClone.findIndex(task => task.id === toTask.id);
    tasksClone.splice(toTaskIndex, 0, activeClone);
  } else {
    tasksClone.push(activeClone);
  }

  return tasksClone;
};

// Нормализация задачи.

export const normalizeTask = task => {
  return {
    ...task,
    status: task.statusId ? taskStatuses[task.statusId] : '',
    timeStatus: getTimeStatus(task.dueDate)
  };
};
