require('dotenv').config();

const express = require('express');
const sql = require('mssql');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// API configuration
const API_CONFIG = {
    webserver: process.env.API_SERVER,
    username: process.env.API_USERNAME,
    password: process.env.API_PASSWORD,
    timeout: 70000
};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Add this before initializing the database connection
sql.on('error', err => {
    console.log('SQL Connection Error:', err);
});

// Helper function to get API token
async function getToken() {
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false
    });

    const apiUrl = `https://${API_CONFIG.webserver}/api/auth/token`;
    
    const loginData = {
        Username: API_CONFIG.username,
        Password: API_CONFIG.password
    };

    try {
        const response = await axios.post(apiUrl, loginData, {
            httpsAgent: httpsAgent,
            timeout: API_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            console.log('Token retrieved successfully');
            console.log('Token:', response.data.token);
            return response.data.token;
        } else {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error('Token retrieval failed:', error.message);
        throw error;
    }
}

// Helper function to call API with token
async function callApiWithToken(tokenValue, mmtParameter) {
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false
    });

    const apiUrl = `https://${API_CONFIG.webserver}/api/get_data`;

    try {
        const response = await axios.post(apiUrl, mmtParameter, {
            httpsAgent: httpsAgent,
            timeout: API_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenValue}`
            }
        });

        if (response.status === 200) {
            console.log('API call successful:', response.data);
            return response.data;
        } else {
            throw new Error(`HTTP ${response.status} - ${response.statusText}: ${response.data}`);
        }
    } catch (error) {
        console.error('API call failed:', error.message);
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    res.redirect('/checkin');
});

// GET route for check-in page - handles both initial load and success message
app.get('/checkin', (req, res) => {
    const { success } = req.query;
    let successMessage = null;
    
    if (success === 'true') {
        successMessage = 'Check-in completed successfully!';
    }
    
    res.render('checkin', { 
        title: 'CheckIn',
        errorMessage: null,
        successMessage: successMessage
    });
});

// POST route for check-in form submission
app.post('/checkin', async (req, res) => {
    const { en } = req.body;
    
    // Validate input
    if (!en || !en.trim()) {
        return res.render('checkin', {
            title: 'CheckIn',
            errorMessage: 'Employee number is required',
            successMessage: null
        });
    }
    
    const employeeNumber = en.trim().toUpperCase();

    // Basic format validation (1 digit, 1 letter, 6 digits)
    const formatRegex = /^[0-9][A-Z][0-9]{6}$/;
    if (!formatRegex.test(employeeNumber)) {
        return res.render('checkin', {
            title: 'CheckIn',
            errorMessage: 'Please enter a valid Employee Number format (e.g., 1A234567)',
            successMessage: null
        });
    }

    try {
        // Get API token
        const token = await getToken();
        
        // Prepare MMT Parameter for employee lookup
        const mmtParameter = {
            vParam01: 'EMPLOYEE_EN',
            vParam02: employeeNumber
        };
        
        // Call API to get employee data
        const employeeData = await callApiWithToken(token, mmtParameter);
        
        // Extract employee information from API response
        if (!employeeData || employeeData.length === 0) {
            return res.render('checkin', {
                title: 'CheckIn',
                errorMessage: 'Employee not found in system',
                successMessage: null
            });
        }
        
        const employee = employeeData[0];
        const empNo = employee.EMP_NO;
        const empName = employee.EMP_NAME_ENG;
        const empDepartment = employee.GL_DESC;
        
        // Redirect to confirmation page with employee data
        res.redirect(`/confirm?en=${empNo}&name=${encodeURIComponent(empName)}&department=${encodeURIComponent(empDepartment)}`);
        
    } catch (error) {
        console.error('Check-in process error:', error);
        return res.render('checkin', {
            title: 'CheckIn',
            errorMessage: error.message || 'System error. Please try again later.',
            successMessage: null
        });
    }
});

app.get('/confirm', async (req, res) => {
    const { en, name, department } = req.query;
    
    if (!en) {
        return res.redirect('/checkin');
    }
    
    try {
        // Check employee number in database
        // await checkEmployeeNumber(en);
        
        // Create employee object
        const employee = {
            en: en,
            name: decodeURIComponent(name || ''),
            department: decodeURIComponent(department || ''),
            timeStamp: new Date(),
            creationDate: new Date(),
            creationBy: 'Web'
        };
        
        res.render('confirm', {
            title: 'Confirm Check-in',
            employee: employee
        });
        
    } catch (error) {
        console.error('Confirmation page error:', error);
        return res.render('checkin', {
            title: 'CheckIn',
            errorMessage: error.message || 'System error. Please try again later.',
            successMessage: null
        });
    }
});

app.post('/confirm', async (req, res) => {
    const { en } = req.body;
    
    if (!en) {
        return res.redirect('/checkin');
    }
    
    try {
        // Get API token
        const token = await getToken();
        
        // Prepare MMT Parameter for evacuation entry
        const mmtParameter = {
            vParam01: 'EVACUATION_ENTRY',
            vParam02: en, // USER EMPLOYEE ID
            vParam03: 'WEB APPS' // CREATION BY
        };
        
        // Call API to insert evacuation entry
        await callApiWithToken(token, mmtParameter);
        
        // Redirect back to check-in page with success message
        res.redirect('/checkin?success=true');
        
    } catch (error) {
        console.error('Check-in confirmation error:', error);
        return res.render('checkin', {
            title: 'CheckIn',
            errorMessage: error.message || 'Failed to complete check-in. Please try again.',
            successMessage: null
        });
    }
});

// API endpoint to get system status
app.get('/api/status', (req, res) => {
    res.json({
        database: pool ? 'connected' : 'disconnected',
        apiServer: API_CONFIG.webserver,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Not Found',
        message: 'Page not found'
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    process.exit(0);
});

// Start server
async function startServer() {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Check-in page: http://localhost:${PORT}/checkin`);
    });
}

startServer().catch(console.error);