import { mount } from '@vue/test-utils';
import TaskCardCreatorTagsAnalyzer
  from '@/modules/tasks/components/TaskCardCreatorTagsAnalyzer';

// Добавляем моковые пропсы
const propsData = {
  tags: '#hello#world'
};

describe('TaskCardCreatorTagsAnalyzer', () => {
  // Переменные, которые будут переопределяться заново для каждого теста
  let wrapper;

  const createComponent = options => {
    wrapper = mount(TaskCardCreatorTagsAnalyzer, options);
  };

  // отрисовывает компонент
  it('component rendered', () => {
    createComponent({ propsData });
    expect(wrapper.exists()).toBeTruthy();
  });

  // успешно эмитит событие установки тегов по событию блюра на инпуте
  it('emits setTags event on blur', async () => {
    createComponent({ propsData });
    const input = wrapper.find('.analyzer');
    await input.trigger('blur');
    expect(wrapper.emitted().setTags).toBeTruthy();
  });

  // успешно эмитит событие установки тегов по нажатию Enter
  it('emits setTags event on keydown enter', async () => {
    createComponent({ propsData });
    const input = wrapper.find('.analyzer');
    await input.trigger('keydown.enter');
    expect(wrapper.emitted().setTags).toBeTruthy();
  });
});
