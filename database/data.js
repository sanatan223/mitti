// DataStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class DataStorage {
  STORAGE_KEY = 'DATA_STORAGE';

  async _loadData() {
    const json = await AsyncStorage.getItem(this.STORAGE_KEY);
    if (json) {
      const data = JSON.parse(json);

      if (!data.soil) data.soil = { id: 0, storage: {} };
      if (!data.soil.id && data.soil.id !== 0) data.soil.id = Object.keys(data.soil.storage || {}).length;
      if (!data.soil.storage) data.soil.storage = {};
      if (!data.aiHistory) data.aiHistory = [];
      return data;
    }
    // Initialize default structure
    const initial = { soil: { id: 0, storage: {} }, aiHistory: [] };
    await this._saveData(initial);
    return initial;
  }

  async _saveData(data) {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  async _saveData(data) {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  async addData({ pH, nitrogen, phosphorus, potassium, moisture, temperature, ec }) {
    const data = await this._loadData();
    const id = data.id;
    data.storage[id] = { id, pH, nitrogen, phosphorus, potassium, moisture, temperature, ec };
    data.id++;
    await this._saveData(data);
    return data.storage[id];
  }

  async getAllData() {
    const data = await this._loadData();
    return Object.values(data.storage);
  }

  async getData(id) {
    const data = await this._loadData();
    return data.storage[id] || null;
  }

  async updateData(id, { pH, nitrogen, phosphorus, potassium, moisture, temperature, ec }) {
    const data = await this._loadData();
    if (!data.storage[id]) throw new Error('Data not found');
    data.storage[id] = { id, pH, nitrogen, phosphorus, potassium, moisture, temperature, ec };
    await this._saveData(data);
    return data.storage[id];
  }

  async deleteData(id) {
    const data = await this._loadData();
    delete data.storage[id];
    await this._saveData(data);
  }

  async addAIMessage(message) {
    const data = await this._loadData();
    data.aiHistory.push(message);
    await this._saveData(data);
  }

  async getAIHistory() {
    const data = await this._loadData();
    return data.aiHistory || [];
  }

  async clearAIHistory() {
    const data = await this._loadData();
    data.aiHistory = [];
    await this._saveData(data);
  }
}

// Singleton instance
export default new DataStorage();
