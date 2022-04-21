import { mount, createLocalVue } from '@vue/test-utils';
import TaskCardCreator from '@/modules/tasks/components/TaskCardCreator';
import TaskCardViewTicksList
  from '@/modules/tasks/components/TaskCardViewTicksList';
import AppButton from '@/common/components/AppButton';
import AppIcon from '@/common/components/AppIcon';
import { generateMockStore } from '@/store/mocks';
import Vuex from 'vuex';
import tasks from '@/static/tasks.json';
import users from '@/static/users.json';

// Создаём локальный тестовый экземпляр Vue.
const localVue = createLocalVue();

// Добавляем к нему Vuex и глобальные компоненты
localVue.component('AppButton', AppButton);
localVue.component('AppIcon', AppIcon);
localVue.use(Vuex);

// Создаём тестовый таск
const taskToEdit = {
  ...tasks[1],
  user: users[0],
  status: 'green',
  timeStatus: 'alert'
};

// Определяем моковый роутер с методом и маршрут с параметром
const mocks = {
  $router: {
    push: jest.fn()
  },
  $route: {
    params: { id: 1 }
  }
};

describe('TaskCardCreator', () => {
  // Переменные, которые будут переопределяться заново для каждого теста
  let store;
  let wrapper;

  const createComponent = options => {
    wrapper = mount(TaskCardCreator, options);
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
  it ('is rendered', () => {
    createComponent({ localVue, store });
    expect(wrapper.exists()).toBeTruthy();
  });

  // закрывает диалоговое окно по клику по нему
  // @click.self="closeDialog"
  it ('closes dialog on click', async () => {
    createComponent({ localVue, store, mocks });
    const dialog = wrapper.find('[data-test="dialog"]');
    await dialog.trigger('click');
    expect(mocks.$router.push).toHaveBeenCalled();
  });

  // закрывает диалоговое окно по нажатию на ESC
  // @keydown.esc="closeDialog"
  it ('closes dialog on esc', async () => {
    createComponent({ localVue, store, mocks });
    const dialog = wrapper.find('[data-test="dialog"]');
    await dialog.trigger('keydown.esc');
    expect(mocks.$router.push).toHaveBeenCalled();
  });

  // закрывает диалоговое окно по клику на кнопку закрытия
  // @click="closeDialog"
  it ('closes dialog on click to close button', async () => {
    createComponent({ localVue, store, mocks });
    const button = wrapper.find('[data-test="close-button"]');
    await button.trigger('click');
    expect(mocks.$router.push).toHaveBeenCalled();
  });

  // рисует кнопку удаления, если в пропсы приходит taskToEdit
  // и удаляет задачу по клику на неё
  // v-if="taskToEdit"
  // @click="removeTask"
  it ('delete task', async () => {
    const propsData = {
      taskToEdit
    };
    createComponent({ localVue, store, mocks, propsData });
    const spyOnRemoveTask = jest.spyOn(wrapper.vm, 'taskDelete');
    const button = wrapper.find('[data-test="remove-task-button"]');
    expect(button.exists()).toBeTruthy();
    expect(button.text()).toBe('Удалить Задачу');
    await button.trigger('click');
    expect(spyOnRemoveTask).toHaveBeenCalled();
  });

  // отрисовывает список статусов задачи для выбора
  // v-for="({ value, label }) in statusList"
  it('renders status list', () => {
    createComponent({ localVue, store, mocks });
    const list = wrapper.findAll('[data-test="status-list"]');
    expect(list.exists()).toBeTruthy();
    expect(list.length).toBe(3);
  });

  // устанавливает статус при клике по нему
  // @click="setStatus(value)"
  it('set status', async () => {
    createComponent({ localVue, store, mocks });
    const spyOnSetStatus = jest.spyOn(wrapper.vm, 'setStatus');
    const listItem = wrapper.find('[data-test="status-list"]');
    await listItem.trigger('click');
    expect(spyOnSetStatus).toHaveBeenCalledWith('green');
  });

  // рисует дату таска, если в пропсы приходит taskToEdit с id
  //  v-if="task.id"
  it('renders task date', () => {
    const propsData = {
      taskToEdit
    };
    createComponent({ localVue, store, mocks, propsData });
    const dateField = wrapper.find('[data-test="task-date"]');
    expect(dateField.text()).toBe('# 2 создана ... время не указано ...');
  });

  // отрисовывает ошибку ввода урла при её наличии
  // v-if="validations.url.error"
  it('render url error test', async () => {
    createComponent({ localVue, store, mocks });
    const errorTest = 'url error';
    await wrapper.setData({ validations: {
      title: {
        error: '',
        rules: ['required']
      },
      url: {
        error: errorTest,
        rules: ['url']
      }
    }
    });
    const errorField = wrapper.find('[data-test="url-error"]');
    expect(errorField.text()).toBe(errorTest);
  });

  // отрисовывает компонент TaskCardViewTicksList и эмитит все его события
  it('renders TaskCardViewTicksList', async () => {
    createComponent({ localVue, store, mocks });
    const ticksList = wrapper.findComponent(TaskCardViewTicksList);
    ticksList.vm.$emit('createTick');
    ticksList.vm.$emit('updateTick', { id: 1 });
    ticksList.vm.$emit('removeTick', { id: 1 });
    expect(ticksList.emitted().createTick).toBeTruthy();
    expect(ticksList.emitted().updateTick).toBeTruthy();
    expect(ticksList.emitted().removeTick).toBeTruthy();
  });

  // закрывает диалоговое окно по клику на кнопку отмены
  // @click="closeDialog"
  it ('closes dialog on cancel click', async () => {
    createComponent({ localVue, store, mocks });
    const dialog = wrapper.find('[data-test="cancel-button"]');
    await dialog.trigger('click');
    expect(mocks.$router.push).toHaveBeenCalled();
  });

  // вызывает метод validateFields из миксина validator
  // при клике на кнопку сохранить
  // @click="submit"
  it ('submit new task', async () => {
    createComponent({ localVue, store, mocks });
    const dialog = wrapper.find('[data-test="submit-button"]');
    const spyValidateFields = jest.spyOn(wrapper.vm, '$validateFields');
    await dialog.trigger('click');
    expect(spyValidateFields).toHaveBeenCalled();
  });
});
