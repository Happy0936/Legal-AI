import Cookies from 'js-cookie';

class NetworkService {
  request(url: string, method: string, body: any, headers: any, callback: (error: any, responseData: any) => void) {
    const token = Cookies.get('authToken');
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Token ${token}` }),
        ...headers,
      },
    };

    if (method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    let BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

    // Clean slashes to avoid trailing double slash bug (e.g., http://127.0.0.1:8000//ai-chat/)
    BASE_URL = BASE_URL.replace(/\/+$/, '');
    const cleanUrl = url.replace(/^\/+/, '');

    fetch(`${BASE_URL}/${cleanUrl}`, fetchOptions)
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
          throw errData;
        }
        return response.json();
      })
      .then((data) => callback(null, data))
      .catch((error) => callback(error, null));
  }
}

export default NetworkService;