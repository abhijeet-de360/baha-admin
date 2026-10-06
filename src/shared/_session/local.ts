function set(key: string, value: string) {
    localStorage.setItem(key,value)
  }
  
  function get(key: string) {
    return localStorage.getItem(key)
  }
  
  function clear(key: string) {
    localStorage.removeItem(key)
  }
  
  function clearAll() {
    localStorage.clear()
  }
  
  export const localService = { set, get, clear, clearAll }