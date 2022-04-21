import { mount } from '@vue/test-utils';
import TaskCard from '@/modules/tasks/components/TaskCard';
import { generateMockStore } from '@/store/mocks';
import tasks from '@/static/tasks.json';
import users from '@/static/users.json';

// Создаём тестовый таск
const task = {
  ...tasks[1],
  user: users[0],
  status: 'green',
  timeStatus: 'alert'
};

// Добавляем моковые пропсы
const propsData = {
  task
};

describe('TaskCard', () => {
  // Переменные, которые будут переопределяться заново для каждого теста
  let wrapper;
  let store;

  const createComponent = options => {
    wrapper = mount(TaskCard, options);
  };

  // Перед каждым тестом создаём хранилище
  beforeEach(() => {
    store = generateMockStore();
  });

  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // отрисовывает компонент
  it('component rendered', () => {
    createComponent({ store, propsData });
    expect(wrapper.exists()).toBeTruthy();
  });

  // вызывается эмит события перетаскивания карточки
  // @drop="$emit('drop', $event)"
  it('emits drop event', async () => {
    createComponent({ store, propsData });
    const appDropElement = wrapper.find('[data-test="app-drop"]');
    await appDropElement.vm.$emit('drop', '');
    expect(wrapper.emitted().drop).toBeTruthy();
  });

  // вызывается эмит события клика по карточке
  // @click="$emit('click', task.id)"
  it('emits click event', async () => {
    createComponent({ store, propsData });
    const taskCard = wrapper.find('[data-test="task-card"]');
    await taskCard.trigger('click');
    expect(wrapper.emitted().click).toBeTruthy();
  });

  // верно отображается статус таска (класс)
  // :class="`task__status--${task.status}`"
  it('shows task status', () => {
    createComponent({ store, propsData });
    const status = wrapper.find('[data-test="task-status"]');
    expect(status.exists()).toBeTruthy();
    expect(status.attributes('class')).toContain('task__status--green');
  });

  // статус таска не отображается при его отсутствии
  it('does not show task status', () => {
    const propsData = {
      task: {
        ...task,
        status: ''
      }
    };
    createComponent({ store, propsData });
    const status = wrapper.find('[data-test="task-status"]');
    expect(status.exists()).toBeFalsy();
  });

  // верно отображается временной статус таска (класс)
  // :class="`task__status--${task.timeStatus}`"
  it('shows task time status', () => {
    createComponent({ store, propsData });
    const status = wrapper.find('[data-test="task-time-status"]');
    expect(status.exists()).toBeTruthy();
    expect(status.attributes('class')).toContain('task__status--alert');
  });

  // временной статус таска не отображается при его отсутствии
  it('does not show task time status', () => {
    const propsData = {
      task: {
        ...task,
        timeStatus: ''
      }
    };
    createComponent({ store, propsData });
    const status = wrapper.find('[data-test="task-time-status"]');
    expect(status.exists()).toBeFalsy();
  });
  // отрисовывает компонент TaskCardTags, если в таске присутствуют теги
  // v-if="task.tags && task.tags.length"
  it('renders TaskCardTags component', () => {
    createComponent({ store, propsData });
    const taskCardComponent = wrapper.find('[data-test="task-card-tags"]');
    expect(taskCardComponent.exists()).toBeTruthy();
  });

  // не отрисовывает компонент TaskCardTags, если в таске отсутствуют теги
  it('does not render TaskCardTags component with no tags', () => {
    const propsData = {
      task: {
        ...task,
        tags: ''
      }
    };
    createComponent({ store, propsData });
    const taskCardComponent = wrapper.find('[data-test="task-card-tags"]');
    expect(taskCardComponent.exists()).toBeFalsy();
  });
});
