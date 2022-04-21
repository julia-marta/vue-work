import { createLocalVue, mount } from '@vue/test-utils';
import TaskCardViewTicksList
  from '@/modules/tasks/components/TaskCardViewTicksList.vue';
import AppIcon from '@/common/components/AppIcon.vue';

// Создаём локальный тестовый экземпляр Vue
// и добавляем к нему глобальные компоненты
const localVue = createLocalVue();
localVue.component('AppIcon', AppIcon);

describe('TaskCardViewTicksList', () => {

  // Добавляем моковые пропсы
  const propsData = {
    disabled: false,
    ticks: [
      { 'id': 1, text: 'foo', 'done': true, 'taskId': 5 },
      { 'id': 2, text: 'bar', 'done': false, 'taskId': 5 },
      { 'id': 3, text: 'baz', 'done': false, 'taskId': 5 }
    ]
  };

  // Переменные, которые будут переопределяться заново для каждого теста
  let wrapper;
  const createComponent = options => {
    wrapper = mount(TaskCardViewTicksList, options);
  };

  // Перед каждым тестом обновляем в пропсах disabled на значение false
  beforeEach(() => {
    propsData.disabled = false;
  });

  // Удаляем тест-обёртку после каждого теста.
  afterEach(() => {
    wrapper.destroy();
  });

  // отрисовывает компонент
  it ('is rendered', async () => {
    createComponent({ localVue });
    expect(wrapper.exists()).toBeTruthy();
  });

  // отрисовывает кнопку создания нового чекбокса, если disabled false
  // <button v-if="!disabled"
  it ('renders create new tick button', () => {
    createComponent({ localVue, propsData });
    const btn = wrapper.find('[data-test="create-tick"]');
    expect(btn.exists()).toBeTruthy();
  });

  // не отрисовывает кнопку создания нового чекбокса, если disabled true
  it ('doesn\'t render create new tick button', () => {
    propsData.disabled = true;
    createComponent({ localVue, propsData });
    const btn = wrapper.find('[data-test="create-tick"]');
    expect(btn.exists()).toBeFalsy();
  });

  // эмитит событие createTick при клике на кнопку создания нового чекбокса
  // @click="$emit('createTick')"
  it ('emits createTick on new tick button click', async () => {
    createComponent({ localVue, propsData });
    const btn = wrapper.find('[data-test="create-tick"]');
    await btn.trigger('click');
    expect(wrapper.emitted().createTick).toBeTruthy();
  });

  // отрисовывает список чекбоксов из пропсов
  // <ul v-if="ticks.length"
  // <li v-for="tick in ticks"
  it ('renders ticks list', () => {
    createComponent({ localVue, propsData });
    const list = wrapper.findAll('[data-test="tick"]');
    expect(Array.from(list).length).toEqual(propsData.ticks.length);
  });

  // эмитит событие updateTick при выборе чекбокса
  // <input v-if="!disabled"
  // @click="updateTick(tick, 'done', !tick.done)"
  it ('emits updateTick on checkbox selection', async () => {
    createComponent({ localVue, propsData });
    const tickCheckbox = wrapper
      .find('[data-test="tick"]')
      .find('input');
    await tickCheckbox.trigger('click');
    expect(wrapper.emitted().updateTick[0][0]).toEqual({
      ...propsData.ticks[0],
      done: !propsData.ticks[0].done
    });
  });

  // эмитит событие updateTick при вводе текста в описание чекбокса
  // @change="updateTick(tick, 'text', $event.target.value)"
  it ('emits updateTick on tick text input change', async () => {
    createComponent({ localVue, propsData });
    const tickTextInput = wrapper.find('[data-test="tick-text-input"]');
    tickTextInput.element.value = 'test';
    await tickTextInput.trigger('change');
    expect(wrapper.emitted().updateTick[0][0]).toEqual({
      ...propsData.ticks[0],
      text: 'test'
    });
  });

  // отрисовывает текст вместо чекбокса если disabled true
  // <span v-else>{{ tick.text }}</span>
  it ('renders tick text when disabled', () => {
    propsData.disabled = true;
    createComponent({ localVue, propsData });
    const btn = wrapper.find('[data-test="tick-text"]');
    expect(btn.exists()).toBeTruthy();
  });

  // не отрисовывает текст вместо чекбокса если disabled false
  it ('doesn\'t render tick text', () => {
    createComponent({ localVue, propsData });
    const btn = wrapper.find('[data-test="tick-text"]');
    expect(btn.exists()).toBeFalsy();
  });

  // не отрисовывает блок с иконками если disabled true
  // :class="{'task-card__icons--hidden': disabled}"
  it ('doesn\'t display tick icon when disabled', () => {
    propsData.disabled = true;
    createComponent({ localVue, propsData });
    const iconsBlock = wrapper.find('[data-test="icons-block"]');
    expect(iconsBlock.attributes('class')).toContain('--hidden');
  });

  // эмитит событие removeTick при клике на иконку удаления
  // @click="$emit('removeTick', { uuid: tick.uuid })"
  it ('emits removeTick on delete-icon click', async () => {
    createComponent({ localVue, propsData });
    const deleteIcon = wrapper.find('[data-test="delete-icon"]');
    await deleteIcon.trigger('click');
    expect(wrapper.emitted().removeTick[0][0]).toEqual({
      uuid: undefined
    });
  });
});
