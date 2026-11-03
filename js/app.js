/**
 * app.js
 * Todo 애플리케이션 진입점 및 컨트롤러 (와이드 대시보드 대응)
 */

const App = {
  currentFilter: 'all',

  /**
   * 기본 초기 데이터 (로컬 스토리지에 데이터가 전혀 없을 때 1회 제공)
   */
  getDefaultTasks() {
    const now = Date.now();
    return [
      {
        id: 'mock_1',
        title: '팀 주간 스프린트 회의 자료 준비 및 공유',
        category: 'work',
        isCompleted: false,
        createdAt: now - 2 * 60 * 60 * 1000 // 2시간 전
      },
      {
        id: 'mock_2',
        title: '퇴근길 영양제 챙겨먹기 및 30분 산책',
        category: 'personal',
        isCompleted: true,
        createdAt: now - 5 * 60 * 60 * 1000 // 5시간 전
      },
      {
        id: 'mock_3',
        title: '자바스크립트 비동기 프로그래밍 및 Promise 복습',
        category: 'study',
        isCompleted: false,
        createdAt: now - 15 * 60 * 1000 // 15분 전
      }
    ];
  },

  /**
   * 화면 및 진행률, 카테고리 카운트를 최신 상태로 동기화합니다.
   * @param {boolean} shouldPersist - 로컬스토리지 저장 여부 (기본 true)
   */
  updateView(shouldPersist = true) {
    const filteredTasks = TaskManager.getFilteredTasks(this.currentFilter);
    UIManager.renderTasks(filteredTasks);
    UIManager.updateProgress(TaskManager.getProgress());
    UIManager.updateFilterCounts(TaskManager.getCategoryCounts());
    UIManager.setActiveFilter(this.currentFilter);

    if (shouldPersist) {
      StorageManager.save(TaskManager.tasks);
    }
  },

  /**
   * 할 일 등록 폼 제출 핸들러
   */
  handleAddTask(e) {
    if (e) e.preventDefault();

    const titleInput = UIManager.elements.todoInput;
    const categorySelect = UIManager.elements.categorySelect;

    const title = (titleInput ? titleInput.value : '').trim();
    const category = categorySelect ? categorySelect.value : 'work';

    if (!title) {
      alert('할 일 내용을 입력해주세요.');
      if (titleInput) titleInput.focus();
      return;
    }

    try {
      TaskManager.addTask(title, category);
      UIManager.clearInput();
      this.updateView();
    } catch (err) {
      console.error('[App] 할 일 추가 실패:', err);
    }
  },

  /**
   * 필터 탭 클릭 핸들러
   */
  handleFilterChange(filterType) {
    if (!filterType) return;
    this.currentFilter = filterType;
    this.updateView(false);
  },

  /**
   * 할 일 목록 인터랙션 핸들러 (이벤트 위임)
   */
  handleListClick(e) {
    const target = e.target;

    // 1. 삭제 버튼 클릭
    const deleteBtn = target.closest('.btn-delete');
    if (deleteBtn) {
      const taskId = deleteBtn.dataset.id;
      if (confirm('이 할 일을 삭제하시겠습니까?')) {
        TaskManager.deleteTask(taskId);
        this.updateView();
      }
      return;
    }

    // 2. 수정 버튼 클릭
    const editBtn = target.closest('.btn-edit');
    if (editBtn) {
      const taskId = editBtn.dataset.id;
      const task = TaskManager.tasks.find(item => item.id === taskId);
      if (!task) return;

      const updatedTitle = prompt('할 일 내용을 수정하세요:', task.title);
      if (updatedTitle !== null && updatedTitle.trim() !== '') {
        TaskManager.updateTask(taskId, updatedTitle);
        this.updateView();
      }
    }
  },

  /**
   * 체크박스 완료 상태 변경 핸들러
   */
  handleCheckboxChange(e) {
    const target = e.target;
    if (target.classList.contains('todo-checkbox')) {
      const taskId = target.dataset.id;
      TaskManager.toggleTask(taskId);
      this.updateView();
    }
  },

  /**
   * 이벤트 리스너 바인딩
   */
  bindEvents() {
    // 할 일 등록
    if (UIManager.elements.todoForm) {
      UIManager.elements.todoForm.addEventListener('submit', (e) => this.handleAddTask(e));
    }

    // 필터 버튼 클릭
    if (UIManager.elements.filterGroup) {
      UIManager.elements.filterGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (btn && btn.dataset.filter) {
          this.handleFilterChange(btn.dataset.filter);
        }
      });
    }

    // 목록 내 수정/삭제 및 체크박스 변경 (위임)
    if (UIManager.elements.todoList) {
      UIManager.elements.todoList.addEventListener('click', (e) => this.handleListClick(e));
      UIManager.elements.todoList.addEventListener('change', (e) => this.handleCheckboxChange(e));
    }
  },

  /**
   * 애플리케이션 초기화
   */
  init() {
    // 1. UI 요소 캐싱
    UIManager.initElements();

    // 2. 스토리지에서 데이터 로드 (없을 경우 기본 데이터 제공)
    const storedTasks = StorageManager.load();
    if (storedTasks === null) {
      TaskManager.tasks = this.getDefaultTasks();
      StorageManager.save(TaskManager.tasks);
    } else {
      TaskManager.tasks = storedTasks;
    }

    // 3. 이벤트 바인딩
    this.bindEvents();

    // 4. 초기 화면 렌더링
    this.updateView(false);

    // 5. 1분마다 상대 시간 동적 갱신
    setInterval(() => {
      this.updateView(false);
    }, 60000);

    console.log('[App] 와이드 반응형 대시보드 초기화 완료');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
