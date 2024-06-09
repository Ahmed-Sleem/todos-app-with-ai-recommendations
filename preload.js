const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadTodos: async () => {
        return await ipcRenderer.invoke('load-todos');
    },
    saveTodos: async (todos) => {
        await ipcRenderer.invoke('save-todos', todos);
    },
    getRecommendation: async (todoContent) => {
        return await ipcRenderer.invoke('get-recommendation', todoContent);
    }
});
