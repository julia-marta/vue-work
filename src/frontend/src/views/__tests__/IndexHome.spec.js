import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import { generateMockStore } from '@/store/mocks';
import { SET_ENTITY } from '@/store/mutations-types';
import users from '@/static/users';
import columns from '@/static/columns';
import { STATUSES } from '@/common/constants';
import { authenticateUser } from '@/common/helpers';
import IndexHome from '@/views/IndexHome.vue';
import AppIcon from '@/common/components/AppIcon';

// Создаём локальный тестовый экземпляр Vue.
const localVue = createLocalVue();

// Добавляем к нему глобальный компонент AppIcon.
localVue.component('AppIcon', AppIcon);

// Добавляем в него Vuex.
localVue.use(Vuex);

// Создаём вспомогательный метод для добавления колонок в тест-хранилище.
const createColumns = store => {
  store.commit(SET_ENTITY, {
    module: 'Columns',
    entity: 'columns',
    value: columns
  });
};

// Начало блока тестов
describe('IndexHome', () => {
  // Заглушка вместо реального router-view
  const stubs = ['router-view'];

  // Переменные, которые будут переопределяться заново для каждого теста
  let actions;
  let store;
  let wrapper;
  const createComponent = options => {
    wrapper = mount(IndexHome, options);
  };

  // Перед каждым тестом заменяем хранилище на новое,
  // а также его действия свежими jest-функциями.
  beforeEach(() => {
    actions = {
      Columns: {
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
      }
    };
    store = generateMockStore(actions);
  });

  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // отрисовывает компонент
  it ('is rendered', () => {
    createComponent({ localVue, store, stubs });
    expect(wrapper.exists()).toBeTruthy();
  });

  // отображает доску с классом desk--rubber, если юзер авторизован
  // :class="{'desk--rubber': isUserAuthorized}"
  it ('displays desk with desk--rubber class', () => {
    authenticateUser(store);
    createComponent({ localVue, store, stubs });
    expect(wrapper.find('.desk--rubber').exists()).toBeTruthy();
  });

  // отображает доску без класса desk--rubber, если юзер не авторизован
  it ('displays desk without desk--rubber class', () => {
    createComponent({ localVue, store, stubs });
    expect(wrapper.find('.desk--rubber').exists()).toBeFalsy();
  });

  // отображает кнопку добавления колонки, если юзер - админ
  // v-if="getUserAttribute('isAdmin')"
  it ('displays add column button', () => {
    authenticateUser(store);
    createComponent({ localVue, store, stubs });
    const button = wrapper.find('[data-test="add-column"]');
    expect(button.exists()).toBeTruthy();
    expect(button.text()).toBe('Добавить столбец');
  });

  // не отображает кнопку добавления колонки, если юзер - админ
  it ('doesn\'t display add column button', () => {
    createComponent({ localVue, store, stubs });
    expect(wrapper.find('[data-test="add-column"]').exists()).toBeFalsy();
  });

  // добавляет новую колонку при нажатии на кнопку
  // @click="addColumn"
  it ('adds new column', async () => {
    authenticateUser(store);
    createColumns(store);
    createComponent({ localVue, store, stubs });
    const button = wrapper.find('[data-test="add-column"]');
    await button.trigger('click');
    expect(actions.Columns.post).toHaveBeenCalledWith(
      expect.any(Object), // The Vuex context
      { title: 'Новый столбец' }
    );
  });

  // отрисовывает фильтры по юзеру из массива юзеров
  // v-for="user in users"
  it ('renders users filters', () => {
    createComponent({ localVue, store, stubs });
    const filters = wrapper.findAll('[data-test="user-filter"]');
    expect(Array.from(filters).length).toEqual(users.length);
  });

  // устанавливает активный класс при клике на фильтр по юзеру
  // :class="{ active: filters.users.some(id => id === user.id) }"
  it ('sets active user filter on click', async () => {
    createComponent({ localVue, store, stubs });
    const filter = wrapper.find('[data-test="user-filter"]');
    await filter.trigger('click');
    expect(filter.attributes('class')).toContain('active');
  });

  // нет активного класса без клика на фильтр по юзеру
  it ('doesn\'t have active user filter', async () => {
    createComponent({ localVue, store, stubs });
    const filter = wrapper.find('[data-test="user-filter"]');
    expect(filter.attributes('class')).not.toContain('active');
  });

  // вызывает мутацию обновления фильтров при клике на фильтр по юзеру
  // @click="filterTasks(user.id, 'users')"
  it ('calls the vuex mutation on user filter click', async () => {
    createComponent({ localVue, store, stubs });
    const spyOnMutation = jest.spyOn(wrapper.vm, 'updateFilters');
    const filter = wrapper.find('[data-test="user-filter"]');
    await filter.trigger('click');
    expect(spyOnMutation).toHaveBeenCalledWith(
      { users: [users[0].id] }
    );
  });

  // отрисовывает фильтры по статусу задачи
  // v-for="({ value, label }) in statuses"
  it ('renders statuses filters', async () => {
    createComponent({ localVue, store, stubs });
    const filters = wrapper.findAll('[data-test="status-filter"]');
    expect(Array.from(filters).length).toEqual(STATUSES.length);
  });

  // устанавливает активный класс при клике на фильтр по статусу
  // :class="{ active: filters.statuses.some(s => s === value) }"
  it ('sets active status filter on click', async () => {
    createComponent({ localVue, store, stubs });
    const filter = wrapper.find('[data-test="status-filter"]');
    await filter.trigger('click');
    expect(filter.attributes('class')).toContain('active');
  });

  // нет активного класса без клика на фильтр по статусу
  it ('doesn\'t have active status filter', async () => {
    createComponent({ localVue, store, stubs });
    const filter = wrapper.find('[data-test="status-filter"]');
    expect(filter.attributes('class')).not.toContain('active');
  });

  // вызывает мутацию обновления фильтров при клике на фильтр по статусу
  // @click="filterTasks(value, 'statuses')"
  it ('calls the vuex mutation on status filter click', async () => {
    createComponent({ localVue, store, stubs });
    const spyOnMutation = jest.spyOn(wrapper.vm, 'updateFilters');
    const filter = wrapper.find('[data-test="status-filter"]');
    await filter.trigger('click');
    expect(spyOnMutation).toHaveBeenCalledWith(
      { statuses: [STATUSES[0].value] }
    );
  });
  // отрисовывает иконку фильтра со значением нужного статуса
  // :class="`meta-filter__status--${value}`"
  it ('renders status filter icon', async () => {
    createComponent({ localVue, store, stubs });
    const filter = wrapper.find('[data-test="status-filter-icon"]');
    expect(filter.attributes('class'))
      .toContain(`meta-filter__status--${STATUSES[0].value}`);
  });

  // отрисовывает колонки, если они есть
  // v-if="columns.length"
  // v-for="column in columns"
  it ('renders columns', async () => {
    createColumns(store);
    createComponent({ localVue, store, stubs });
    const columnsHtml = wrapper.findAll('[data-test="columns"]');
    expect(Array.from(columnsHtml).length).toEqual(columns.length);
  });

  // не отрисовывает колонки, если их нет
  it ('doesn\'t render columns', async () => {
    createComponent({ localVue, store, stubs });
    const columnsHtml = wrapper.findAll('[data-test="columns"]');
    expect(columnsHtml.exists()).toBeFalsy();
  });

  // при обновлении колонки эмитится действие put из модуля Columns хранилища
  // @update="put($event)"
  it ('calls column update action', () => {
    createColumns(store);
    createComponent({ localVue, store, stubs });
    const columnHtml = wrapper.find('[data-test="columns"]');
    columnHtml.vm.$emit('update', 'test');
    expect(actions.Columns.put).toHaveBeenCalledWith(
      expect.any(Object), // The Vuex context
      'test'
    );
  });

  // при удалении колонки эмитится действие delete из модуля Columns хранилища
  // @delete="deleteColumn"
  it ('calls column delete action', () => {
    createColumns(store);
    createComponent({ localVue, store, stubs });
    const columnHtml = wrapper.find('[data-test="columns"]');
    columnHtml.vm.$emit('delete', 'test');
    expect(actions.Columns.delete).toHaveBeenCalledWith(
      expect.any(Object), // The Vuex context
      'test'
    );
  });

  // отрисовывает пустой блок с текстом, если нет колонок
  // v-else ... class="desk__emptiness"
  it ('renders no-columns text', async () => {
    createComponent({ localVue, store, stubs });
    const text = wrapper.findAll('[data-test="no-columns-text"]');
    expect(text.exists()).toBeTruthy();
  });

  // не отрисовывает пустой блок с текстом, если есть колонки
  it ('doesn\'t render no-columns text', async () => {
    createColumns(store);
    createComponent({ localVue, store, stubs });
    const text = wrapper.findAll('[data-test="no-columns-text"]');
    expect(text.exists()).toBeFalsy();
  });
});

// Список элементов для тестирования
/*
  + :class="{'desk--rubber': isUserAuthorized}"
  + v-if="getUserAttribute('isAdmin')"
  + @click="addColumn"
  + v-for="user in users"
  + :class="{ active: filters.users.some(id => id === user.id) }"
  + @click="filterTasks(user.id, 'users')"
  + v-for="({ value, label }) in statuses"
  + :class="{ active: filters.statuses.some(s => s === value) }"
  + @click="filterTasks(value, 'statuses')"
  + :class="`meta-filter__status--${value}`"
  + v-if="columns.length"
  + v-for="column in columns"
  + @update="put($event)"
  + @delete="deleteColumn"
  + v-else ... class="desk__emptiness"
  + ...mapActions('Columns', ['post', 'put', 'delete']),
  + ...mapMutations('Tasks'...),
*/

// Данные из тест хранилища
/*
  ...mapState(['users']),
  ...mapState('Auth', ['user']),
  ...mapState('Columns', ['columns']),
  ...mapState('Tasks', ['filters']),
  ...mapGetters('Auth', ['getUserAttribute']),
 */
