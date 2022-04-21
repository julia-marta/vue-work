import { mount } from '@vue/test-utils';
import TaskCardCreatorTags
  from '@/modules/tasks/components/TaskCardCreatorTags';
import TaskCardCreatorTagsAnalyzer
  from '@/modules/tasks/components/TaskCardCreatorTagsAnalyzer';

// Добавляем моковые пропсы
const propsData = {
  tags: '#hello#world'
};

describe('TaskCardCreatorTags', () => {
  // Переменные, которые будут переопределяться заново для каждого теста
  let wrapper;

  const createComponent = options => {
    wrapper = mount(TaskCardCreatorTags, options);
  };

  // отрисовывает компонент
  it('component rendered', () => {
    createComponent({ propsData });
    expect(wrapper.exists()).toBeTruthy();
  });

  // отрисовывает tags analyzer
  it('renders tags analyzer', () => {
    createComponent({ propsData });
    const analyzer = wrapper.findComponent(TaskCardCreatorTagsAnalyzer);
    expect(analyzer.exists()).toBeTruthy();
  });

  // Analyzer успешно эмитит событие установки тегов
  it('emit setTags event', () => {
    createComponent({ propsData });
    const analyzer = wrapper.findComponent(TaskCardCreatorTagsAnalyzer);
    analyzer.vm.$emit('setTags', '');
    expect(wrapper.emitted().setTags).toBeTruthy();
  });
});
