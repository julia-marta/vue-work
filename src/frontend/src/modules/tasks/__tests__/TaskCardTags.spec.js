import { shallowMount } from '@vue/test-utils';
import TaskCardTags from '@/modules/tasks/components/TaskCardTags.vue';

describe('TaskCardTags', () => {

  // Добавляем моковые пропсы
  const propsData = {
    tags: '#tag1#tag2#tag3'
  };

  // Переменные, которые будут переопределяться заново для каждого теста
  let wrapper;
  const createComponent = options => {
    wrapper = shallowMount(TaskCardTags, options);
  };

  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // отрисовывает компонент
  it ('is rendered', () => {
    createComponent({ propsData });
    expect(wrapper.exists()).toBeTruthy();
  });

  // отрисовывает теги из пропсов
  it ('renders tags', () => {
    createComponent({ propsData });
    const tags = wrapper.findAll('[data-test="tag"]');
    expect(Array.from(tags).length)
      .toEqual(propsData.tags.split('#').length - 1);
  });
});
