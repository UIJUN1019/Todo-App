/**
 * tasks.js
 * 할 일(Task) 데이터 조작 및 비즈니스 로직을 담당하는 모듈 (Step 2 & 와이드 대시보드)
 */

const TaskManager = {
  // 관리 중인 할 일 목록
  tasks: [],

  /**
   * 카테고리 코드에 대응하는 한국어 명칭 매핑
   */
  CATEGORY_LABELS: {
    work: '업무',
    personal: '개인',
    study: '공부'
  },

  /**
   * 카테고리 코드 검증 및 반환
   * @param {string} category
   * @returns {'work'|'personal'|'study'}
   */
  normalizeCategory(category) {
    return ['work', 'personal', 'study'].includes(category) ? category : 'work';
  },

  /**
   * 새로운 할 일을 생성하여 목록 맨 앞에 추가합니다.
   * @param {string} title - 할 일 내용
   * @param {'work'|'personal'|'study'} category - 카테고리
   * @returns {Object} 생성된 새 Task 객체
   */
  addTask(title, category = 'work') {
    const trimmedTitle = (title || '').trim();
    if (!trimmedTitle) {
      throw new Error('할 일 내용을 입력해주세요.');
    }

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: trimmedTitle,
      category: this.normalizeCategory(category),
      isCompleted: false,
      createdAt: Date.now()
    };

    this.tasks.unshift(newTask);
    return newTask;
  },

  /**
   * 할 일의 완료 여부를 토글합니다.
   * @param {string} id - 할 일 고유 ID
   * @returns {Object|null} 변경된 할 일 객체
   */
  toggleTask(id) {
    const task = this.tasks.find(item => item.id === id);
    if (task) {
      task.isCompleted = !task.isCompleted;
      return task;
    }
    return null;
  },

  /**
   * 할 일을 목록에서 삭제합니다.
   * @param {string} id - 삭제할 할 일 고유 ID
   * @returns {boolean} 삭제 성공 여부
   */
  deleteTask(id) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(item => item.id !== id);
    return this.tasks.length < initialLength;
  },

  /**
   * 할 일 제목을 수정합니다.
   * @param {string} id - 할 일 고유 ID
   * @param {string} newTitle - 새로운 제목
   * @returns {Object|null}
   */
  updateTask(id, newTitle) {
    const trimmedTitle = (newTitle || '').trim();
    if (!trimmedTitle) {
      return null;
    }

    const task = this.tasks.find(item => item.id === id);
    if (task) {
      task.title = trimmedTitle;
      return task;
    }
    return null;
  },

  /**
   * 현재 필터 조건에 부합하는 할 일 목록을 반환합니다.
   * @param {'all'|'work'|'personal'|'study'} filterType
   * @returns {Array} 필터링된 할 일 목록
   */
  getFilteredTasks(filterType = 'all') {
    if (!filterType || filterType === 'all') {
      return this.tasks;
    }
    return this.tasks.filter(item => item.category === filterType);
  },

  /**
   * 진행 통계를 계산하여 반환합니다.
   * @returns {{ total: number, completed: number, percent: number }}
   */
  getProgress() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(item => item.isCompleted).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, percent };
  },

  /**
   * 카테고리별 건수 현황을 반환합니다.
   * @returns {{ all: number, work: number, personal: number, study: number }}
   */
  getCategoryCounts() {
    return {
      all: this.tasks.length,
      work: this.tasks.filter(item => item.category === 'work').length,
      personal: this.tasks.filter(item => item.category === 'personal').length,
      study: this.tasks.filter(item => item.category === 'study').length
    };
  },

  /**
   * 카테고리 레이블을 반환합니다.
   * @param {string} category
   * @returns {string}
   */
  getCategoryLabel(category) {
    return this.CATEGORY_LABELS[category] || '기타';
  }
};
