const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'john@gmail.com', // A potential dummy email based on App.tsx fake data from earlier or just test
            password: 'password123'
        });
        console.log("Login Success:", res.data);
    } catch (error) {
        if (error.response) {
            console.error("Login Failed:", error.response.status, error.response.data);
        } else {
            console.error("Login Error:", error.message);
        }
    }
}
test();
