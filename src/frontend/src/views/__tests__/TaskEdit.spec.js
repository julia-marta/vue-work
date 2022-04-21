import { createLocalVue, mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import TaskEdit from '@/views/TaskEdit';
import AppButton from '@/common/components/AppButton';
import { generateMockStore } from '@/store/mocks';
import Vuex from 'vuex';

// Создаём локальный тестовый экземпляр Vue.
const localVue = createLocalVue();

// Добавляем в него Vuex.
localVue.use(Vuex);

// Создаём моковый экземпляр хранилища.
const store = generateMockStore();

// Начало блока тестов
describe('TaskEdit', () => {
  // Определяем моковый маршрут с параметрами,
  // роутер с методом go и экземпляр АПИ-сервиса для задач с методом get
  const mocks = {
    $route: {
      params: {
        id: 5
      }
    },
    $router: {
      go: jest.fn()
    },
    $api: {
      tasks: {
        get: jest.fn()
      }
    }
  };

  // Добавляем глобальный компонент AppButton.
  const stubs = {
    AppButton
  };

  // Нормализованная моковая задача
  const normalizedTask = {
    'id':5,
    'title':'Задача № 5',
    'description':'Описание задачи № 5',
    'sortOrder':1,
    'dueDate':null,
    'url':null,
    'urlDescription':null,
    'createdAt':'2021-05-15T08:36:01.917Z',
    'updatedAt':'2021-05-15T08:36:01.917Z',
    'tags':'Бекэнд#Срочно#Срочно#Для верски',
    'columnId':null,
    'statusId':1,
    'userId':'29234cd0-f308-432d-bb6a-8b199140ab77',
    'user':{
      'id':'29234cd0-f308-432d-bb6a-8b199140ab77',
      'name':'Игорь Пятин',
      'avatar':'/public/user6.jpg'
    },
    'ticks':[],
    'status':'green',
    'timeStatus':''
  };

  // Переменные, которые будут переопределяться заново для каждого теста
  let wrapper;
  const createComponent = options => {
    wrapper = mount(TaskEdit, options);
  };

  // Перед каждым тестом заменяем методы роутера и АПИ-сервиса
  // свежими jest-функциями.
  // API-вызов подменяем на jest функцию, которая возвращает промис,
  // передаем в него тестовую задачу
  beforeEach(() => {
    mocks.$router.go = jest.fn();
    mocks.$api.tasks.get = jest.fn(() => Promise.resolve(normalizedTask));
  });

  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // отображает компонент после того, как таск загружен
  it('component is displayed after task is loaded', async () => {
    createComponent({ localVue, mocks, stubs, store });
    // дожидаемся выполнения всех промисов
    await flushPromises();
    expect(wrapper.html()).toBeTruthy();
  });

  // перенаправляет на предыдущую страницу,
  // если возникла ошибка при получении задачи
  it('redirects to previous page if request failed', async () => {
    mocks.$api.tasks.get = jest.fn(() => Promise.reject());
    createComponent({ mocks, stubs });
    await flushPromises();
    expect(mocks.$router.go).toHaveBeenCalledWith(-1);
  });
});
