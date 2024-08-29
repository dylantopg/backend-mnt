import { Hono } from 'hono';
import { getDb } from '../db/database';

const app = new Hono();

// Utility function to handle database operations with error handling
async function executeQuery(query: string, params: any[] = []) {
    const db = await getDb();
    try {
        await db.run(query, params);
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Database operation failed');
    }
}

// Utility function to fetch data from the database
async function fetchQuery(query: string, params: any[] = []) {
    const db = await getDb();
    try {
        return await db.all(query, params);
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Database fetch failed');
    }
}

// Employee-related functions
export async function createEmployee(unique_ci: string, name: string, department: string, cel: number) {
    await executeQuery(`INSERT INTO employees (unique_ci, name, department, cel) VALUES (?, ?, ?, ?)`, [unique_ci, name, department, cel]);
}

export async function deleteEmployee(unique_ci: string) {
    await executeQuery(`DELETE FROM employees WHERE unique_ci = ?`, [unique_ci]);
}

export async function editEmployee(unique_ci: string, name: string, department: string, cel: number) {
    await executeQuery(`UPDATE employees SET name = ?, department = ?, cel = ? WHERE unique_ci = ?`, [name, department, cel, unique_ci]);
}

// Routes
app.post('/attendances', async (c) => {
    try {
        const { employee_ci, check_in, check_out } = await c.req.json();

        if (!employee_ci || !check_in || !check_out) {
            return c.text('Missing required fields', 400);
        }

        // Check if the employee exists
        const employeeExists = await fetchQuery(`SELECT * FROM employees WHERE unique_ci = ?`, [employee_ci]);
        if (employeeExists.length === 0) {
            return c.text('Employee not registered', 404);
        }

        await executeQuery(`INSERT INTO attendance (employee_ci, check_in, check_out) VALUES (?, ?, ?)`, [employee_ci, check_in, check_out]);
        return c.text('Attendance recorded', 201);
    } catch (error) {
        return c.text('Internal Server Error', 500);
    }
});

app.get('/attendances', async (c) => {
    try {
        const records = await fetchQuery(`SELECT * FROM attendance`);
        return c.json(records);
    } catch (error) {
        return c.text('Internal Server Error', 500);
    }
});

app.get('/attendances/:employee_ci', async (c) => {
    try {
        const { employee_ci } = c.req.param();
        const { start_date, end_date } = c.req.query();

        const records = await fetchQuery(`SELECT * FROM attendance WHERE employee_ci = ? AND check_in BETWEEN ? AND ?`, [employee_ci, start_date, end_date]);

        if (records.length === 0) {
            return c.text('No records found', 404);
        }

        return c.json(records);
    } catch (error) {
        return c.text('Internal Server Error', 500);
    }
});

app.get('/employees', async (c) => {
    try {
        const employees = await fetchQuery('SELECT * FROM employees');
        if (employees.length === 0) {
            return c.text('No employees found', 404);
        }
        return c.json(employees);

    } catch (error) {
        return c.text('Internal server Error', 500)
    }
})

app.post('/employees', async (c) => {
    try {
        const { unique_ci, name, department, cel } = await c.req.json();
        await createEmployee(unique_ci, name, department, cel);
        return c.text('Employee created', 201);
    } catch (error) {
        return c.text('Internal Server Error', 500);
    }
});

app.delete('/employees/:unique_ci', async (c) => {
    try {
        const { unique_ci } = c.req.param();
        await deleteEmployee(unique_ci);
        return c.text('Employee deleted', 200);
    } catch (error) {
        return c.text('Internal Server Error', 500);
    }
});

app.put('/employees/:unique_ci', async (c) => {
    try {
        const { unique_ci } = c.req.param();
        const { name, department, cel } = await c.req.json();
        await editEmployee(unique_ci, name, department, cel);
        return c.text('Employee updated', 200);
    } catch (error) {
        return c.text('Internal Server Error', 500);
    }
});

export default app;
