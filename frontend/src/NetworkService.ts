import Cookies from 'js-cookie';

class NetworkService {
  // ...existing code...
  
  request(url: string, method: string, body: any, headers: any, callback: (error: any, responseData: any) => void) {
    const token = Cookies.get('authToken');
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...token && { 'Authorization': `Token ${token}` },
        ...headers,  // Merge additional headers
      },
    };

    if (method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    
   const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}
    

    fetch(`${BASE_URL}/${url}`, fetchOptions)
      
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err });
      }
      return response.json();
    })
    .then(data => callback(null, data))
    .catch(error => callback(error, null));
  }
}

export default NetworkService;
