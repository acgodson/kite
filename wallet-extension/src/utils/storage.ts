
// export const storage: any = {
//     data: {},
//     local: {
//       get(key: string, callback: any) {
//         const result: any = {};
//         result[key] = storage.data[key];
//         callback(result);
//       },
//       set(data: any, callback: any) {
//         storage.data = { ...storage.data, ...data };
//         callback();
//       },
//     },
//   };
  

  export const storage: any = {
    local: {
      get(key: string, callback: any) {
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.get([key], function(result: any) {
            callback(result);
          });
        } else {
          // Fallback to localStorage with conversion
          try {
            const item = localStorage.getItem(key);
            const result: any = {};
            result[key] = item ? JSON.parse(item) : null;
            callback(result);
          } catch (error) {
            console.error("Error reading from localStorage", error);
            callback({}); // Fallback to an empty object in case of error
          }
        }
      },
      set(data: any, callback: any) {
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set(data, function() {
            if (callback) callback();
          });
        } else {
          // Fallback to localStorage with conversion
          try {
            Object.keys(data).forEach((key) => {
              const value = JSON.stringify(data[key]);
              localStorage.setItem(key, value);
            });
            if (callback) callback();
          } catch (error) {
            console.error("Error writing to localStorage", error);
          }
        }
      },
    },
  };