import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import { generateMockStore } from '@/store/mocks';
import { SET_ENTITY } from '@/store/mutations-types';
import tasks from '@/static/tasks';
import columns from '@/static/columns';
import DeskColumn from '@/modules/columns/components/DeskColumn';
import AppIcon from '@/common/components/AppIcon';
import { authenticateUser } from '@/common/helpers';

// Создаём локальный тестовый экземпляр Vue.
const localVue = createLocalVue();

// Добавляем к нему Vuex и глобальные компоненты
localVue.use(Vuex);
localVue.component('AppIcon', AppIcon);

// Создаём вспомогательный метод для добавления тасков в тест-хранилище.
const addTasks = store => {
  store.commit(SET_ENTITY, {
    module: 'Tasks',
    entity: 'tasks',
    value: tasks
  });
};

describe('DeskColumn', () => {
  // Добавляем моковые пропсы
  const propsData = {
    column: columns[0]
  };

  // Определяем моковый роутер с методом
  const mocks = {
    $router: {
      push: jest.fn()
    }
  };

  // Фильтруем таски для текущей колонки
  const filteredTasks = tasks.filter(task => {
    return task.columnId === propsData.column.id;
  });

  // Переменные, которые будут переопределяться заново для каждого теста
  let store;
  let wrapper;
  const createComponent = options => {
    wrapper = mount(DeskColumn, options);
  };

  // Перед каждым тестом создаём хранилище
  // и заменяем свежей jest-функциями метод роутера
  beforeEach(() => {
    store = generateMockStore();
    mocks.$router.push = jest.fn();
  });

  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // отрисовывает компонент
  it ('is rendered', () => {
    createComponent({ localVue, store, propsData });
    expect(wrapper.exists()).toBeTruthy();
  });

  // отрисовывает название колонки, совпадающее с названием из пропсов
  // <span v-if="!isInputShowed">
  it ('renders column title', () => {
    createComponent({ localVue, store, propsData });
    const columnTitle = wrapper.find('[data-test="column-title"]');
    expect(columnTitle.text()).toContain(propsData.column.title);
  });

  // не отрисовывает название колонки, если она в режиме редактирования
  it ('doesn\'t render column title', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, propsData });
    const editIcon = wrapper.find('[data-test="edit-icon"]');
    await editIcon.trigger('click');
    const columnTitle = wrapper.find('[data-test="column-title"]');
    expect(columnTitle.exists()).toBeFalsy();
  });

  // отрисовывает инпут вместо названия, если колонка в режиме редактирования
  // <input ... v-else
  // @click="showInput"
  it ('renders column title input on edit icon click', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, propsData });
    const editIcon = wrapper.find('[data-test="edit-icon"]');
    expect(editIcon.exists()).toBeTruthy();
    await editIcon.trigger('click');
    const titleInput = wrapper.find('[data-test="title-input"]');
    expect(titleInput.exists()).toBeTruthy();
  });

  // вызывает обновление названия колонки при блюре с инпута
  // @blur="updateInput"
  it ('emits update for column title on input blur', async () => {
    const columnNewTitle = 'Column new title';
    authenticateUser(store);
    createComponent({ localVue, store, propsData });
    const editIcon = wrapper.find('[data-test="edit-icon"]');
    await editIcon.trigger('click');
    const titleInput = wrapper.find('[data-test="title-input"]');
    titleInput.element.value = columnNewTitle;
    await titleInput.trigger('input');
    await titleInput.trigger('blur');
    expect(wrapper.emitted().update[0][0]).toEqual({
      id: propsData.column.id,
      title: columnNewTitle
    });
  });

  // не отрисовывает иконку редактирования, если юзер не админ
  // v-if="!isInputShowed && isAdmin"
  it ('doesn\'t render edit icon if not admin', () => {
    createComponent({ localVue, store, propsData });
    const editIcon = wrapper.find('[data-test="edit-icon"]');
    expect(editIcon.exists()).toBeFalsy();
  });

  // отрисовывает иконку удаления
  // v-if="!isInputShowed && isAdmin && !columnTasks.length"
  it ('renders delete icon', () => {
    authenticateUser(store);
    createComponent({ localVue, store, propsData });
    const deleteIcon = wrapper.find('[data-test="delete-icon"]');
    expect(deleteIcon.exists()).toBeTruthy();
  });

  // вызывает удаление колонки при нажатии на иконку удаления
  // @click="$emit('delete', column.id)"
  it ('emits delete for column on delete icon click', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, propsData });
    const deleteIcon = wrapper.find('[data-test="delete-icon"]');
    await deleteIcon.trigger('click');
    expect(wrapper.emitted().delete[0][0]).toEqual(propsData.column.id);
  });

  // отрисовывает в колонке отфильтрованные таски
  // v-for="task in columnTasks"
  it ('renders tasks', () => {
    addTasks(store);
    createComponent({ localVue, store, propsData });
    const tasksList = wrapper.findAll('[data-test="task"]');
    expect(Array.from(tasksList).length).toEqual(filteredTasks.length);
  });

  // вызывается миксин moveTask на событии перетаскивания карточки
  // @drop="$moveTask($event, task)"
  it ('moves task on drop on task', () => {
    addTasks(store);
    authenticateUser(store);
    createComponent({ localVue, store, propsData });
    const spyOnMoveTask = jest.spyOn(wrapper.vm, '$moveTask');
    const task = wrapper.find('[data-test="task"]');
    task.vm.$emit('drop', filteredTasks[0]);
    expect(spyOnMoveTask).toHaveBeenCalled();
  });

  // переходит на карточку нужного таска при клике на него
  // @click="$router.push({ path: `/${task.id}` })"
  it ('redirects to task on task card click', () => {
    addTasks(store);
    createComponent({ localVue, store, propsData, mocks });
    const task = wrapper.find('[data-test="task"]');
    task.vm.$emit('click');
    expect(mocks.$router.push).toHaveBeenCalledWith({
      path: `/${filteredTasks[0].id}`
    });
  });
});
