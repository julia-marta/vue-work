import TaskCardCreatorDueDateSelector
  from '@/modules/tasks/components/TaskCardCreatorDueDateSelector';
import { mount } from '@vue/test-utils';
import Datepicker from 'vuejs-datepicker';

// Добавляем моковые пропсы
const propsData = {
  dueDate: new Date(2021, 1, 1)
};

describe('TaskCardCreatorDueDateSelector', () => {
  // Переменные, которые будут переопределяться заново для каждого теста
  let wrapper;

  const createComponent = options => {
    wrapper = mount(TaskCardCreatorDueDateSelector, options);
  };

  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // отрисовывает компонент
  it('component rendered', () => {
    createComponent({ propsData });
    expect(wrapper.exists()).toBeTruthy();
  });

  // отрисовывает Datepicker
  it('render date picker', () => {
    createComponent({ propsData });
    const datepicker = wrapper.findComponent(Datepicker);
    expect(datepicker.exists()).toBeTruthy();
  });

  // Datepicker успешно эмитит событие инпута
  it('emit input event', () => {
    createComponent({ propsData });
    const datepicker = wrapper.findComponent(Datepicker);
    datepicker.vm.$emit('input', '02.01.2021');
    expect(wrapper.emitted().input).toBeTruthy();
  });
});
