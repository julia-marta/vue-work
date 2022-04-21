import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import { generateMockStore } from '@/store/mocks';
import flushPromises from 'flush-promises';
import users from '@/static/users';
import TaskCardViewComments
  from '@/modules/tasks/components/TaskCardViewComments.vue';
import AppTextarea from '@/common/components/AppTextarea.vue';
import { authenticateUser } from '@/common/helpers';

// Создаём локальный тестовый экземпляр Vue.
const localVue = createLocalVue();

// Добавляем к нему Vuex и глобальные компоненты
localVue.use(Vuex);
localVue.component('AppTextarea', AppTextarea);

// Создаём тестовые комменты
const comments = [{
  createdAt: '2021-05-17T15:42:53.903Z',
  id: 1,
  taskId: 1,
  text: 'foo',
  updatedAt: '2021-05-17T15:42:53.904Z',
  userId: 'cdr09037-1569-4542-as83-gt5d34a48c33',
  user: {
    id:'cdr09037-1569-4542-as83-gt5d34a48c33',
    name:'Админ','avatar':'/public/admin.jpg'
  }
}];

// Создаём тестовый новый коммент
const newComment = {
  createdAt: '2021-05-17T15:42:53.903Z',
  id: 2,
  taskId: 1,
  text: 'New comment',
  updatedAt: '2021-05-17T15:42:53.904Z',
  userId: 'cdr09037-1569-4542-as83-gt5d34a48c33'
};

// Создаём тестового юзера
const user = {
  id: users[0].id,
  name: users[0].name,
  avatar: users[0].avatar
};

describe('TaskCardViewComments', () => {
  // Добавляем моковые пропсы
  const propsData = {
    taskId: 1,
    comments
  };

  // Определяем моковый экземпляр АПИ-сервиса для комментов с методом post,
  const mocks = {
    $api: {
      comments: { post: null }
    }
  };

  // Переменные, которые будут переопределяться заново для каждого теста
  let store;
  let wrapper;
  const createComponent = options => {
    wrapper = mount(TaskCardViewComments, options);
  };

  // Перед каждым тестом создаём стор
  // API-вызов подменяем на jest функцию, которая возвращает промис,
  // передаем в него тестовый новый коммент
  beforeEach(() => {
    store = generateMockStore();
    mocks.$api.comments.post = jest.fn(() => Promise.resolve(newComment));
  });

  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // отрисовывает компонент
  it ('is rendered', () => {
    createComponent({ localVue, store, mocks, propsData });
    expect(wrapper.exists()).toBeTruthy();
  });

  // отрисовывает коммменты из пропсов
  // v-for="comment in comments"
  it ('renders comments', () => {
    createComponent({ localVue, store, mocks, propsData });
    const comments = wrapper.findAll('li');
    expect(Array.from(comments).length).toEqual(propsData.comments.length);
  });

  // отрисовывает форму для добавления коммента, когда юзер авторизован
  // <form v-if="user"
  it ('renders form when authorized', () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks, propsData });
    const form = wrapper.find('form');
    expect(form.exists()).toBeTruthy();
  });

  // не отрисовывает форму для добавления коммента, если юзер не авторизован
  it ('doesn\'t render form when not authorized', () => {
    createComponent({ localVue, store, mocks, propsData });
    const form = wrapper.find('form');
    expect(form.exists()).toBeFalsy();
  });

  // отрисовывает ошибку внутри компонента AppTextarea
  // при попытке отправки пустого коммента
  // :error-text="validations.newComment.error"
  it ('renders error when submit empty comment', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks, propsData });
    const errorText = 'Поле не заполнено';
    const submitBtn = wrapper.find('[data-test="submit-btn"]');
    await submitBtn.trigger('click');
    const textarea = wrapper.find('[data-test="textarea"]');
    expect(textarea.text()).toContain(errorText);
  });

  // компонент AppTextarea эмитит событие инпута и передаёт введённый текст
  // коммент сохраняется в data
  // по нажатию на кнопку сабмита происходит вызов метода АПИ-сервиса post
  // а также эмитится во внешний компонент событие new-comment
  // @click.prevent="submit"
  // await this.$api.comments.post
  // this.$emit('new-comment'
  it ('posts new comment and submit', async () => {
    authenticateUser(store);
    createComponent({ localVue, store, mocks, propsData });
    const textarea = wrapper.find('[data-test="textarea"]');
    textarea.vm.$emit('input', newComment.text);
    const submitBtn = wrapper.find('[data-test="submit-btn"]');
    await submitBtn.trigger('click');
    await flushPromises();
    expect(mocks.$api.comments.post).toHaveBeenCalledWith({
      taskId: newComment.taskId,
      userId: newComment.userId,
      text: newComment.text
    });
    expect(wrapper.emitted()['new-comment'][0][0]).toEqual({
      ...newComment,
      user
    });
  });
});
