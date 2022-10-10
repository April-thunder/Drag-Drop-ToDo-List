// Смена темной и светлой темы

  const cssSwitchTheme = document.querySelector('[title="theme"]');
  // Берем последнюю используемую тему из Local Storage
  const themeStart = localStorage.getItem('theme') || 'light';
  const themeSwitcher = document.querySelectorAll('.theme-link');

  // Подключаем для своей темы свой css файл. Для этого будем устанавливать атрибут DOM-свойств. Далее по клику переключаем атрибут
  cssSwitchTheme.setAttribute('href', `themes/theme-${themeStart}.css`); 

  themeSwitcher.forEach(switcher => {
    switcher.addEventListener('click', (event) => {
      const themeLink = `themes/theme-${event.target.dataset.theme}.css`;
      cssSwitchTheme.setAttribute('href', themeLink);
      // Текущую тему кладем в Local Storage
      localStorage.setItem('theme', event.target.dataset.theme);
    });
  });
  

// Отсчитываем и устанвливаем счетчик задачи

  const subtitle = document.querySelector('.subtitle');  
  const checkboxInput = document.getElementById('checkboxInput');
  const input = document.getElementById('input');

  const countTask = document.getElementById('count');
  // Переменная преобразует строку из списка задач JSON (который мы получили ранее и положили в Local Storage)
  // Или принимает значение стартового пустого списка задач
  let taskList = JSON.parse(localStorage.getItem('tasks')) || [];

  const setTaskCount = () => {
    let count = 0;
    if (taskList.length) {
      // На основе массива вычисляем значение с помощью reduce. Функция применяется по очереди ко всем элементам массива и «переносит» свой результат на следующий вызов.  
      count = taskList.reduce((acc, task) => acc + Number(!task.checkStatus), 0);
    } 
    countTask.innerText = count;

    (!count && taskList.length) ? footerView(taskList.length) : footerView(count);
  };

// Функция настраивает разное отображение футера для десктопной и мобильной версий
  const footerView = (count) => {
    if (count) {
      footer.style.display = 'flex';
      footerDesktop.style.display = 'flex';
      subtitle.style.display = 'block';
    } else {
      footer.style.display = 'none';
      footerDesktop.style.display = 'none';
      subtitle.style.display = 'none';
    }
  };

// При добавлении задач нужно изменять вид углов в таблице

  const repairBorderRadius = () => {
    if (taskList.length) {
      document.querySelector(`[data-id="[${prevFirstTaskId}]"]`)?.classList.remove('task-first');
      document.querySelector(`[data-id="[${taskList[0].id}]"]`).classList.add('task-first');
      prevFirstTaskId = taskList[0].id;
    }
  };  

// Добавление и отображение новой задачи

  const tasksContainer = document.querySelector('.tasks');

  const addTask = (taskValue, idTask = Date.now(), checkStatus = false, dataStorage = false) => {
    const newTask = `
        <li class="task-wrapper">
          <div data-id=[${idTask}] class="task" draggable="true">
            <label class="task-inner">
              <input ${checkStatus ? 'checked' : ''} class="checkbox" type="checkbox">
              <span class="fake">
                <svg class="mark" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
              </span>
              <p class="task-text">${taskValue}</p>
            </label>
            <span class="cross"></span>
          </div>
        </li>
      `;
    tasksContainer.insertAdjacentHTML('beforeend', newTask);
    input.value = '';

    if (!dataStorage) {
      taskList.push({taskValue, checkStatus, id: idTask});
      localStorage.tasks = JSON.stringify(taskList);
    }

    repairBorderRadius();
    setTaskCount();
    addDragAndDrop();
  };

  // Отфильтровываем
  const filteredTasks = (filter = null) => {
    taskList.forEach(task => {
      if (filter === null) {
        tasksContainer.querySelector(`[data-id="[${task.id}]"]`).style.display = 'block';
      } else if (task.checkStatus === filter) {
        tasksContainer.querySelector(`[data-id="[${task.id}]"]`).style.display = 'block';
      } else {
        tasksContainer.querySelector(`[data-id="[${task.id}]"]`).style.display = 'none';
      }
    });
  };

// Удаляем задачу
  const removeTask = (idTask) => {
    document.querySelector(`[data-id="[${idTask}]"]`).parentElement.remove();
    
    taskList = taskList.filter(task => task.id !== idTask);
    localStorage.tasks = JSON.stringify(taskList);
    
    repairBorderRadius();
    setTaskCount();
  };

// Обновление статуса задачи
    const updateCheckTask = (idTask) => {
      taskList.forEach(task => {
        if (task.id === idTask) {
          task.checkStatus = !task.checkStatus;
        }
      });
  
      localStorage.tasks = JSON.stringify(taskList);
  
      setTaskCount();
    };

// Выделение действующей кнопки фильтра

  const filterBtns = document.querySelectorAll('.filter-btn');

  const setActiveFilter = (filterActive) => {
    filterBtns.forEach(btn => {
      btn.classList.remove('filter-btn_active');
    });
    filterActive.classList.add('filter-btn_active');
  };
  
// Настройки мобильной и дектопных версий

  let footer = document.querySelector('.footer-mobile');
  let footerDesktop = document.querySelector('.task-footer');  
  let prevFirstTaskId, allBtn, activeBtn, completedBtn;

  if (window.getComputedStyle(footer).display === 'none') {
    allBtn = filterBtns[0];
    activeBtn = filterBtns[1];
    completedBtn = filterBtns[2];
    footer = footerDesktop;
  } else {
    allBtn = filterBtns[3];
    activeBtn = filterBtns[4];
    completedBtn = filterBtns[5];
  }

  // Задача из Local Storage

  taskList.forEach(task => addTask(task.taskValue, task.id, task.checkStatus, true));
  setTaskCount();


  // Добавляем новую задачу
  input.addEventListener('keydown', (event) => {
    if (event.keyCode === 13 && input.value) {
      event.preventDefault();
      addTask(input.value);
      setTaskCount();
      filteredTasks();
      setActiveFilter(allBtn);
    }
  });
  
  // Отметка о выполнении задачи
  checkboxInput.addEventListener('click', () => {
    if (checkboxInput.checked && input.value) {
      checkboxInput.checked = false;
      addTask(input.value);
      filteredTasks();
      setActiveFilter(allBtn);
    }
  });
  
  // Удаление задачи обновление статуса
  tasksContainer.addEventListener('click', (event) => {
    const target = event.target,
    idTask = +target.closest('.task').dataset?.id.replace(/\D/g, '');
    
    if (target.className === 'cross') {
      removeTask(idTask);
    }
    
    if (target.className === 'checkbox') {
      updateCheckTask(idTask);
    }
  });

  // Убрать выполненные
  const clearBtn = document.querySelector('.task-clear');

  clearBtn.addEventListener('click', () => {
    taskList.forEach(task => {
      if (task.checkStatus) {
        removeTask(task.id);
      }
    });
  });

  // Фильтры
  allBtn.addEventListener('click', (event) => {
    filteredTasks();
    setActiveFilter(event.target);
  });
  
  activeBtn.addEventListener('click', (event) => {
    filteredTasks(false);
    setActiveFilter(event.target);
  });
  
  completedBtn.addEventListener('click', (event) => {
    filteredTasks(true);
    setActiveFilter(event.target);
  });

  // Drag and drop 
  let dragStartIndex;

  function addDragAndDrop() {
    const draggables = document.querySelectorAll('.task'),
          dragItems = tasksContainer.querySelectorAll('.task-wrapper');

    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', dragStart);
    });

    dragItems.forEach(dragItem => {
      dragItem.addEventListener('dragover', dragOver);
      dragItem.addEventListener('drop', dragDrop);
      dragItem.addEventListener('dragenter', dragEnter);
      dragItem.addEventListener('dragleave', dragLeave);
    });
  }

  // Drag start
  function dragStart() {
    dragStartIndex = +this.dataset.id.replace(/\D/g, '');
  }

  // Drag enter 
  function dragEnter() {
    this.firstElementChild.classList.add('over');
  }
  
  // Drag leave
  function dragLeave() {
    this.firstElementChild.classList.remove('over');
  }

  // Drag over
  function dragOver(event) {
    event.preventDefault();
  }

  // Drag drop
  function dragDrop(event) {
    const dragEndIndex = +event.target.dataset.id.replace(/\D/g, '');
    event.target.classList.remove('over');

    swapItems(dragStartIndex, dragEndIndex);
    repairBorderRadius();
  }

  // Меняем местами задачи
  function swapItems(fromIndex, toIndex) {
    const itemOne = tasksContainer.querySelector(`[data-id="[${fromIndex}]"]`);
    const itemTwo = tasksContainer.querySelector(`[data-id="[${toIndex}]"]`);
    const parentItemOne = itemOne.parentElement;
    const parentItemTwo = itemTwo.parentElement;

    itemOne.remove();
    itemTwo.remove();

    parentItemOne.append(itemTwo);
    parentItemTwo.append(itemOne);

    // Сохраняем в Local Storage
    saveSwapItems(fromIndex, toIndex);
  }

  function saveSwapItems(fromIndex, toIndex) {
    let j = taskList.length - 1;
    for (let i = 0; i < taskList.length;) {
      if (taskList[i].id === fromIndex) {
        if (taskList[j].id === toIndex) {
          [taskList[i], taskList[j]] = [taskList[j], taskList[i]];
          break;
        } else {
          j--;
        }
      } else {
        i++;
      }
    }
    localStorage.tasks = JSON.stringify(taskList);
  };


