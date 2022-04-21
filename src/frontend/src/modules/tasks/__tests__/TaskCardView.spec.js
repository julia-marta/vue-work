import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import { generateMockStore } from '@/store/mocks';
import flushPromises from 'flush-promises';
import TaskCardView from '@/modules/tasks/components/TaskCardView.vue';
import AppTextarea from '@/common/components/AppTextarea.vue';
import AppIcon from '@/common/components/AppIcon.vue';
import { authenticateUser } from '@/common/helpers';

// Создаём локальный тестовый экземпляр Vue.
const localVue = createLocalVue();

// Добавляем к нему Vuex и глобальные компоненты
localVue.use(Vuex);
localVue.component('AppTextarea', AppTextarea);
localVue.component('AppIcon', AppIcon);

// Создаём тестовый таск
const normalizedTask = {
  'id':5,
  'title':'Задача № 5',
  'description':'Описание задачи № 5',
  'sortOrder':1,
  'dueDate':1621263324730,
  'url':'https://test.com',
  'urlDescription':null,
  'createdAt':'2021-05-15T08:36:01.917Z',
  'updatedAt':'2021-05-15T08:36:01.917Z',
  'tags':'#foo#baz#bar',
  'columnId':null,
  'statusId':1,
  'userId':'cdr09037-1569-4542-as83-gt5d34a48c33',
  'user':{
    'id':'cdr09037-1569-4542-as83-gt5d34a48c33',
    'name':'Админ',
    'avatar':'/public/admin.jpg'
  },
  'ticks':[
    { 'id': 1, text: 'foo', 'done': false, 'taskId': 5 },
    { 'id': 2, text: 'bar', 'done': false, 'taskId': 5 },
    { 'id': 3, text: 'baz', 'done': false, 'taskId': 5 }
  ],
  'status':'green',
  'timeStatus':'',
  'comments': [],
  'avatar':'/public/admin.jpg'
};

// Создаём тестовый коммент
const newComment = {
  createdAt: '2021-05-17T15:42:53.903Z',
  id: 1,
  taskId: 2,
  text: 'foo',
  updatedAt: '2021-05-17T15:42:53.904Z',
  user: {
    'id':'cdr09037-1569-4542-as83-gt5d34a48c33',
    'name':'Админ','avatar':'/public/admin.jpg'
  }
};

describe('TaskCardView', () => {

  // Определяем моковый экземпляр АПИ-сервиса для задач с методом get,
  // моковый роутер с методом push и маршрут с параметром
  const mocks = {
    $api: {
      tasks: {
        get: () => Promise.resolve()
      }
    },
    $route: {
      params: { id: 5 }
    },
    $router: {
      push: jest.fn()
    }
  };

  // Переменные, которые будут переопределяться заново для каждого теста
  let actions;
  let store;
  let wrapper;
  const createComponent = options => {
    wrapper = mount(TaskCardView, options);
  };

  // Перед каждым тестом подменяем действия модуля Ticks
  // свежими jest-функциями, создаём с ними хранилище
  // API-вызов подменяем на jest функцию, которая возвращает промис,
  // передаем в него тестовую задачу
  // заменяем метод роутера свежими jest-функциями.
  beforeEach(() => {
    actions = {
      Ticks: {
        put: jest.fn()
      }
    };

    store = generateMockStore(actions);
    mocks.$api.tasks.get = () => Promise.resolve(normalizedTask);
    mocks.$router.push = jest.fn();
  });

  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // отрисовывает компонент если есть таска
  // нужно завершить все промисы с помощью flushPromises,
  // чтобы выполнить mocks.$api.tasks.get
  // v-if="!!task"
  it ('is rendered', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    expect(wrapper.exists()).toBeTruthy();
  });

  // закрывает диалоговое окно по клику на обёртку
  // @click.self="closeDialog"
  // this.$router.push('/');
  it ('closes dialog on wrapper click', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const wrapperElement = wrapper.find('div');
    await wrapperElement.trigger('click');
    expect(mocks.$router.push).toHaveBeenCalledWith('/');
  });

  // закрывает диалоговое окно по нажатию на ESC
  // @keydown.esc="closeDialog"
  // this.$router.push('/');
  it ('closes dialog on ESC keydown', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    await wrapper.trigger('keydown.esc');
    expect(mocks.$router.push).toHaveBeenCalledWith('/');
  });

  // закрывает диалоговое окно по клику на кнопку закрытия
  // button @click="closeDialog"
  // this.$router.push('/');
  it ('closes dialog on close-button click', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const closeBtn = wrapper.find('[data-test="close-btn"]');
    await closeBtn.trigger('click');
    expect(mocks.$router.push).toHaveBeenCalledWith('/');
  });

  // для Админа название карточки отображается иначе
  // :class="{ 'task-card__name--min' : isAdmin }"
  it ('task card name has different view for admin', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const taskName = wrapper.find('[data-test="task-name"]');
    expect(taskName.attributes('class'))
      .toContain('task-card__name--min');
  });

  // для Админа отображается кнопка редактирования таска
  // <a v-if="isAdmin"
  it ('renders edit button for admin', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const editBtn = wrapper.find('[data-test="edit-btn"]');
    expect(editBtn.exists()).toBeTruthy();
  });

  // кнопка редактирования таска не отображается для обычных юзеров
  it ('doesn\'t render edit button for non-admin', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const editBtn = wrapper.find('[data-test="edit-btn"]');
    expect(editBtn.exists()).toBeFalsy();
  });

  // по клику на кнопку редактирования происходит редирект
  // на окно редактирования таска
  // @click="$router.push({ name: 'TaskEdit' ...
  it ('redirects to task edit on edit button click', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const editBtn = wrapper.find('[data-test="edit-btn"]');
    await editBtn.trigger('click');
    expect(mocks.$router.push).toHaveBeenCalledWith({
      name: 'TaskEdit',
      params: { id: mocks.$route.params.id }
    });
  });

  // отрисовывает ответственного за таск, если он есть
  // <li v-if="task && task.user">
  it ('renders task user', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const taskUser = wrapper.find('[data-test="task-user"]');
    expect(taskUser.exists()).toBeTruthy();
  });

  // отрисовывает срок таска, если он есть
  // <li v-if="dueDate"></li>
  it ('renders task date', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const taskDate = wrapper.find('[data-test="task-date"]');
    expect(taskDate.exists()).toBeTruthy();
  });

  // отрисовывает описание таска, если оно есть
  // v-if="task && task.description"
  it ('renders task description', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const taskDesc = wrapper.find('[data-test="task-description"]');
    expect(taskDesc.exists()).toBeTruthy();
  });

  // отрисовывает ссылку в таске, если она есть
  // v-if="task && task.url"
  it ('renders task url', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const taskUrl = wrapper.find('[data-test="task-url"]');
    expect(taskUrl.exists()).toBeTruthy();
  });

  // отрисовывает блок с чеклистом, если он есть в таске
  // и если юзер является автором таска
  // v-if="showTicks"
  it ('renders task ticks', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const ticksBlock = wrapper.find('[data-test="task-ticks-block"]');
    expect(ticksBlock.exists()).toBeTruthy();
  });

  // компонент TaskCardViewTicksList эмитит событие обновления чеклиста
  // и вызывает экшен put модуля Ticks
  // @updateTick="put"
  it ('updates tick', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const ticksComponent = wrapper.find('[data-test="task-ticks"]');
    ticksComponent.vm.$emit('updateTick', 'test');
    expect(actions.Ticks.put).toHaveBeenCalledWith(
      expect.any(Object), // The Vuex context
      'test'
    );
  });

  // отрисовывает теги в таске, если они есть
  // v-if="showTags"
  it ('renders task tags', async () => {
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const taskTags = wrapper.find('[data-test="task-tags"]');
    expect(taskTags.exists()).toBeTruthy();
  });

  // отрисовывает блок комментов в таске, если они есть
  // или если юзер авторизован
  // v-if="task && (user || task.comments)"
  it ('renders task comments', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const taskComments = wrapper.find('[data-test="task-comments"]');
    expect(taskComments.exists()).toBeTruthy();
  });

  // компонент TaskCardViewComments эмитит событие нового коммента
  // и вызывает метод addCommentToList
  // одновременно обновляет комменты в хранилище внутри компонента
  // @new-comment="addCommentToList"
  it ('adds new comment', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks });
    await flushPromises();
    const taskComments = wrapper.find('[data-test="task-comments"]');
    taskComments.vm.$emit('new-comment', newComment);
    expect(normalizedTask.comments[0]).toEqual(newComment);
  });
});
