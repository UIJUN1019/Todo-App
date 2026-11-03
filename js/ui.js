/**
 * ui.js
 * 화면 렌더링 및 UI 업데이트를 전담하는 모듈 (와이드 대시보드 대응)
 */

const UIManager = {
  // DOM 요소 캐싱
  elements: {
    todoForm: null,
    todoInput: null,
    categorySelect: null,
    addBtn: null,
    todoList: null,
    emptyState: null,
    filterGroup: null,
    filterBtns: null,
    completedCount: null,
    totalCount: null,
    progressPercent: null,
    progressBarFill: null,
    currentFilterTitle: null,
    countAll: null,
    countWork: null,
    countPersonal: null,
    countStudy: null
  },

  /**
   * 주요 DOM 요소를 캐싱합니다.
   */
  initElements() {
    this.elements.todoForm = document.getElementById('todoForm');
    this.elements.todoInput = document.getElementById('todoInput');
    this.elements.categorySelect = document.getElementById('categorySelect');
    this.elements.addBtn = document.getElementById('addBtn');
    this.elements.todoList = document.getElementById('todoList');
    this.elements.emptyState = document.getElementById('emptyState');
    this.elements.filterGroup = document.getElementById('filterGroup');
    this.elements.filterBtns = document.querySelectorAll('.filter-btn');
    this.elements.completedCount = document.getElementById('completedCount');
    this.elements.totalCount = document.getElementById('totalCount');
    this.elements.progressPercent = document.getElementById('progressPercent');
    this.elements.progressBarFill = document.getElementById('progressBarFill');
    this.elements.currentFilterTitle = document.getElementById('currentFilterTitle');
    this.elements.countAll = document.getElementById('countAll');
    this.elements.countWork = document.getElementById('countWork');
    this.elements.countPersonal = document.getElementById('countPersonal');
    this.elements.countStudy = document.getElementById('countStudy');
  },

  /**
   * XSS 방지를 위한 텍스트 이스케이프
   * @param {string} str
   * @returns {string}
   */
  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * 생성 시간 타임스탬프를 읽기 쉬운 상대 시간 문자열로 변환합니다.
   * @param {number} timestamp
   * @returns {string} 예: "방금 전", "5분 전", "2시간 전", "3일 전"
   */
  formatRelativeTime(timestamp) {
    if (!timestamp) return '방금 전';
    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

    if (diffSeconds < 60) {
      return '방금 전';
    }
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}시간 전`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  },

  /**
   * 단일 할 일 항목의 HTML 문자열을 생성합니다.
   * @param {Object} task
   * @returns {string}
   */
  createTaskItemHTML(task) {
    const isCompleted = Boolean(task.isCompleted);
    const category = task.category || 'work';
    const categoryLabel = TaskManager.getCategoryLabel(category);
    const timeText = this.formatRelativeTime(task.createdAt);
    const safeTitle = this.escapeHTML(task.title);

    return `
      <li class="todo-item ${isCompleted ? 'is-completed' : ''}" data-id="${task.id}">
        <div class="todo-content">
          <label class="checkbox-container">
            <input
              type="checkbox"
              id="check-${task.id}"
              class="todo-checkbox"
              ${isCompleted ? 'checked' : ''}
              data-id="${task.id}"
            />
            <span class="custom-checkbox" aria-hidden="true"></span>
          </label>
          <div class="todo-text-group">
            <label for="check-${task.id}" class="todo-title">${safeTitle}</label>
            <div class="todo-meta">
              <span class="category-badge badge-${category}">${categoryLabel}</span>
              <span class="todo-time">${timeText}</span>
            </div>
          </div>
        </div>
        <div class="todo-actions">
          <button type="button" class="btn-action btn-edit" data-id="${task.id}" aria-label="할 일 수정">수정</button>
          <button type="button" class="btn-action btn-delete" data-id="${task.id}" aria-label="할 일 삭제">삭제</button>
        </div>
      </li>
    `;
  },

  /**
   * 할 일 목록을 화면에 동적으로 렌더링합니다.
   * @param {Array} tasks
   */
  renderTasks(tasks) {
    if (!this.elements.todoList) return;

    if (!tasks || tasks.length === 0) {
      this.elements.todoList.innerHTML = '';
      this.toggleEmptyState(true);
      return;
    }

    this.toggleEmptyState(false);
    this.elements.todoList.innerHTML = tasks.map(task => this.createTaskItemHTML(task)).join('');
  },

  /**
   * 진행률 바 및 수치 텍스트를 갱신합니다.
   * @param {{ total: number, completed: number, percent: number }} progress
   */
  updateProgress(progress) {
    const { total = 0, completed = 0, percent = 0 } = progress || {};

    if (this.elements.completedCount) {
      this.elements.completedCount.textContent = completed;
    }
    if (this.elements.totalCount) {
      this.elements.totalCount.textContent = total;
    }
    if (this.elements.progressPercent) {
      this.elements.progressPercent.textContent = `${percent}%`;
    }
    if (this.elements.progressBarFill) {
      this.elements.progressBarFill.style.width = `${percent}%`;
      const track = this.elements.progressBarFill.parentElement;
      if (track) {
        track.setAttribute('aria-valuenow', percent);
      }
    }
  },

  /**
   * 필터별 카운트 뱃지를 갱신합니다.
   * @param {{ all: number, work: number, personal: number, study: number }} counts
   */
  updateFilterCounts(counts) {
    if (!counts) return;
    if (this.elements.countAll) this.elements.countAll.textContent = counts.all || 0;
    if (this.elements.countWork) this.elements.countWork.textContent = counts.work || 0;
    if (this.elements.countPersonal) this.elements.countPersonal.textContent = counts.personal || 0;
    if (this.elements.countStudy) this.elements.countStudy.textContent = counts.study || 0;
  },

  /**
   * 빈 상태(Empty State) 화면 노출 여부를 토글합니다.
   * @param {boolean} isEmpty
   */
  toggleEmptyState(isEmpty) {
    if (this.elements.emptyState) {
      this.elements.emptyState.style.display = isEmpty ? 'block' : 'none';
    }
  },

  /**
   * 상단 필터 버튼 중 활성화된 버튼을 시각적으로 강조하고 목록 타이틀을 갱신합니다.
   * @param {string} currentFilter
   */
  setActiveFilter(currentFilter = 'all') {
    if (this.elements.filterBtns) {
      this.elements.filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        const isActive = filter === currentFilter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    if (this.elements.currentFilterTitle) {
      const titles = {
        all: '전체 목록',
        work: '업무 목록',
        personal: '개인 목록',
        study: '공부 목록'
      };
      this.elements.currentFilterTitle.textContent = titles[currentFilter] || '할 일 목록';
    }
  },

  /**
   * 입력 필드를 초기화하고 포커스를 줍니다.
   */
  clearInput() {
    if (this.elements.todoInput) {
      this.elements.todoInput.value = '';
      this.elements.todoInput.focus();
    }
  }
};
