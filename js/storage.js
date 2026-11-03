/**
 * storage.js
 * LocalStorage 데이터 영속화를 담당하는 모듈 (Step 2)
 */

const StorageManager = {
  STORAGE_KEY: 'my_tasks_data_v2',

  /**
   * 로컬 스토리지에서 할 일 목록을 불러옵니다.
   * 저장된 데이터가 없을 경우 null을 반환하여 기본 초기 데이터 세팅을 유도합니다.
   * @returns {Array|null} 할 일 객체 배열 또는 null
   */
  load() {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) {
        return null;
      }
      const data = JSON.parse(serialized);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[StorageManager] 데이터 로드 실패:', error);
      return [];
    }
  },

  /**
   * 할 일 목록을 로컬 스토리지에 저장합니다.
   * @param {Array} tasks - 저장할 할 일 배열
   */
  save(tasks) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('[StorageManager] 데이터 저장 실패:', error);
    }
  },

  /**
   * 저장된 할 일 데이터를 모두 삭제합니다.
   */
  clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('[StorageManager] 스토리지 초기화 실패:', error);
    }
  }
};
