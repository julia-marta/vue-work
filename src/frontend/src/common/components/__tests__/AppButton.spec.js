// Кнопка — это глупый компонент. Монтируем её с помощью shallowMount.
import { shallowMount } from '@vue/test-utils';
// Импортируем сам компонент.
import AppButton from '@/common/components/AppButton';

// Указываем название блока тестов — соответствует названию компонента.
describe('AppButton', () => {
// Определяем входные параметры по умолчанию и заглушки.
  const slots = { default: 'content' };
  const defaultBtnType = 'button';
  const propsData = { type: 'submit' };
  const listeners = { click: null };

  // wrapper — тест-обёртка над компонентом.
  let wrapper;

  // Для каждого теста мы будем создавать новую обёртку.
  const createComponent = options => {
    wrapper = shallowMount(AppButton, options);
  };

  // Перед каждым тестом мы будем заменять click-событие свежей jest-функцией.
  // Это нужно для того, чтобы очистить информацию о вызове в предыдущих тестах.
  beforeEach(() => {
    listeners.click = jest.fn();
  });

  // Уничтожаем обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // Проверяем, что кнопка отображает контент дефолтного слота.
  it('renders out the slot content', () => {
    createComponent({ slots });
    expect(wrapper.html()).toContain(slots.default);
  });

  // Вызывает событие click при нажатии.
  it('raises the click event on click', async () => {
    createComponent({ listeners });
    await wrapper.find('button').trigger('click');
    expect(listeners.click).toHaveBeenCalled();
  });

  // Если входные параметры не переданы, тип кнопки задан по умолчанию.
  it('button type is button', () => {
    createComponent();
    expect(wrapper.attributes('type')).toBe(defaultBtnType);
  });

  // Тип кнопки задан входными параметрами.
  it('button type is submit', () => {
    createComponent({ propsData });
    expect(wrapper.attributes('type')).toBe(propsData.type);
  });
});
