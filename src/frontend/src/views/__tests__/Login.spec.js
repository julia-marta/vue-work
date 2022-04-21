import { mount, createLocalVue } from '@vue/test-utils';
import $validator from '@/common/mixins/validator';
import Login from '@/views/Login';
import AppButton from '@/common/components/AppButton';
import AppInput from '@/common/components/AppInput';

// Создаём локальный тестовый экземпляр Vue.
const localVue = createLocalVue();

// Добавляем к нему глобальные компоненты
localVue.component('AppButton', AppButton);
localVue.component('AppInput', AppInput);

describe('Login', () => {
  // Переменные, которые будут переопределяться заново для каждого теста
  let routerPush;
  let dispatch;
  let login;

  // Определяем методы компонента
  const methods = {
    login
  };
  // Определяем моковый роутер, хранилище и добавляем миксин валидатор
  const mocks = {
    $router: {
      push: routerPush
    },
    $store: {
      dispatch
    },
    $validator
  };
  // Заглушка вместо реального router-link
  const stubs = [
    'router-link'
  ];

  let wrapper;
  const createComponent = options => {
    wrapper = mount(Login, options);
  };
  // Перед каждым тестом заменяем свежими jest-функциями
  // метод роутера, dispatch хранилища и метод компонента
  // и записываем их в нужные объекты
  beforeEach(() => {
    routerPush = jest.fn();
    dispatch = jest.fn();
    login = jest.fn();
    methods.login = login;
    mocks.$router.push = routerPush;
    mocks.$store.dispatch = dispatch;
  });
  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // переходит на главную при нажатии на кноку закрытия
  it ('redirects to index on close button click', async () => {
    createComponent({ localVue, mocks, stubs });
    const closeBtn = wrapper.find('[data-test="close-button"]');
    await closeBtn.trigger('click');
    expect(routerPush).toHaveBeenCalledWith('/');
  });

  // миксин валидации вызывается при сабмите формы,
  // при этом не вызывается dispatch
  it('validation mixin has been called on form submit', async () => {
    createComponent({ localVue, mocks, stubs });
    const spyValidateFields = jest.spyOn(wrapper.vm, '$validateFields');
    await wrapper.find('form').trigger('submit');
    expect(spyValidateFields).toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  // вызывает метод login и переходит на главную если данные верны
  it(
    'calls login and redirects to index if credentials are valid',
    async () => {
      createComponent({ localVue, mocks, stubs });
      const emailInput = wrapper
        .find('[data-test="email-component"]')
        .find('input');
      const passInput = wrapper
        .find('[data-test="password-component"]')
        .find('input');

      emailInput.element.value = 'test@gmail.com';
      await emailInput.trigger('input');
      passInput.element.value = '123456';
      await passInput.trigger('input');

      await wrapper.find('form').trigger('submit');
      expect(dispatch).toHaveBeenCalled();
      expect(routerPush).toHaveBeenCalledWith('/');
    });
});
