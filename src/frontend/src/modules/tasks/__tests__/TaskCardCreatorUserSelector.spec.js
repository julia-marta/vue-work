import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import { generateMockStore } from '@/store/mocks';
import users from '@/static/users';
import TaskCardCreatorUserSelector
  from '@/modules/tasks/components/TaskCardCreatorUserSelector.vue';
import AppIcon from '@/common/components/AppIcon';

// Создаём локальный тестовый экземпляр Vue.
const localVue = createLocalVue();

// Добавляем к нему Vuex и глобальные компоненты
localVue.use(Vuex);
localVue.component('AppIcon', AppIcon);

describe('TaskCardCreatorUserSelector', () => {

  // Добавляем моковые пропсы
  const propsData = {
    currentWorkerId: '1'
  };

  // Переменные, которые будут переопределяться заново для каждого теста
  let store;
  let wrapper;

  // Заменяем директиву клик аутсайд моковой функцией
  const createComponent = options => {
    wrapper = mount(TaskCardCreatorUserSelector, {
      ...options,
      directives: {
        clickOutside: jest.fn()
      }
    });
  };

  // Перед каждым тестом создаём хранилище и заменяем проп currentWorkerId
  beforeEach(() => {
    store = generateMockStore();
    propsData.currentWorkerId = users[0].id;
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

  // отображает кнопку "добавить пользователя" если нет currentWorkerId
  // v-if="!currentWorker"
  it ('displays add button', () => {
    propsData.currentWorkerId = '';
    createComponent({ localVue, store, propsData });
    const btn = wrapper.find('[data-test="add-user-button"]');
    expect(btn.exists()).toBeTruthy();
  });

  // не отображает кнопку "добавить пользователя" если есть currentWorkerId
  it ('doesn\'t display add button', () => {
    createComponent({ localVue, store, propsData });
    const btn = wrapper.find('[data-test="add-user-button"]');
    expect(btn.exists()).toBeFalsy();
  });

  // отображает список юзеров при нажатии на кнопку "добавить пользователя"
  // @click.stop="isMenuOpened = !isMenuOpened"
  // v-if="isMenuOpened"
  it ('displays users list on add button click', async () => {
    propsData.currentWorkerId = '';
    createComponent({ localVue, store, propsData });
    const btn = wrapper.find('[data-test="add-user-button"]');
    await btn.trigger('click');
    const usersList = wrapper.find('[data-test="users-list"]');
    expect(usersList.exists()).toBeTruthy();
  });

  // отображает кнопку с выбранным по currentWorkerId юзером
  // <button v-else class="users-list__user"
  it ('displays selected user button', async () => {
    createComponent({ localVue, store, propsData });
    const btn = wrapper.find('[data-test="selected-user-button"]');
    expect(btn.exists()).toBeTruthy();
  });

  // не отображает кнопку с выбранным юзером, если нет currentWorkerId
  it ('doesn\'t display selected user button', async () => {
    propsData.currentWorkerId = '';
    createComponent({ localVue, store, propsData });
    const btn = wrapper.find('[data-test="selected-user-button"]');
    expect(btn.exists()).toBeFalsy();
  });

  // отображает список юзеров при клике на аватар выбранного юзера
  // img @click.stop="isMenuOpened = !isMenuOpened"
  // v-if="isMenuOpened"
  it ('displays users list on user button image click', async () => {
    createComponent({ localVue, store, propsData });
    const btn = wrapper.find('[data-test="selected-user-button"]');
    const image = btn.find('img');
    await image.trigger('click');
    const usersList = wrapper.find('[data-test="users-list"]');
    expect(usersList.exists()).toBeTruthy();
  });

  // отображает список юзеров при клике на имя выбранного юзера
  // <span @click.stop="isMenuOpened = !isMenuOpened">
  // v-if="isMenuOpened"
  it ('displays users list on user name click', async () => {
    createComponent({ localVue, store, propsData });
    const btn = wrapper.find('[data-test="selected-user-button"]');
    const span = btn.find('span');
    await span.trigger('click');
    const usersList = wrapper.find('[data-test="users-list"]');
    expect(usersList.exists()).toBeTruthy();
  });

  // эмитит событие селекта при клике на иконку
  // @click="$emit('select', null)"
  it ('emits select on app-icon click', () => {
    createComponent({ localVue, store, propsData });
    const appIcon = wrapper.find('[data-test="app-icon"]');
    appIcon.vm.$emit('click');
    expect(wrapper.emitted().select[0][0]).toEqual(null);
  });

  // отрисовывает юзеров из стора
  // v-for="user in users"
  it ('renders users', async () => {
    propsData.currentWorkerId = '';
    createComponent({ localVue, store, propsData });
    const btn = wrapper.find('[data-test="add-user-button"]');
    await btn.trigger('click');
    const usersElements = wrapper.findAll('[data-test="user"]');
    expect(Array.from(usersElements).length).toEqual(users.length);
  });

  // при клике на юзер в списке вызывается событие setUser,
  // которое эмитит событие селекта и прячет список юзеров
  // @click="setUser(user.id)"
  it ('emits on select user and hide list', async () => {
    propsData.currentWorkerId = '';
    createComponent({ localVue, store, propsData });
    const btn = wrapper.find('[data-test="add-user-button"]');
    await btn.trigger('click');
    const userElement = wrapper.find('[data-test="user"]');
    const userBtn = userElement.find('button');
    await userBtn.trigger('click');
    expect(wrapper.emitted().select[0][0]).toEqual(users[0].id);
    const usersList = wrapper.find('[data-test="users-list"]');
    expect(usersList.exists()).toBeFalsy();
  });
});
