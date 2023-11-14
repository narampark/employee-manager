const inquirer = require("inquirer");
const mysql = require("mysql2");
require('dotenv').config();

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.user,
  password: process.env.password,
  database: "employee_db",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connected to database");
  start();
});

function start() {
  inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee's role",
        "Update employee manager",
        "View employees by manager",
        "View employees by department",
        "Delete Departments | Roles | Employees",
        "View the total utilized budget of a department",
        "Quit",
    ],
  })
  .then((answer) => {
    switch (answer.action) {
        case "View all departments":
            viewAllDepartments();
            break;
        case "View all roles":
            viewAllRoles();
            break;
        case "View all employees":
            viewAllEmployees();
            break;
        case "Add a department":
            AddDepartment();
            break;
        case "Add a role":
            addRole();
            break;
        case "Add an employee":
            addEmployee();
            break;
        case "Update an employee role":
            updateEmployeeRole();
            break;
        case "Update employee manager":
            updateEmployeeManager();
            break;
        case "View employees by manager":
            viewEmployeesByManager();
            break;
        case "View employees by department":
            viewEmployeesByDepartment();
            break;
        case "Delete Departments | Roles | Employees":
            deleteDepartmentsRolesEmployees();
            break;
        case "View the total utilized budget of a department":
            viewTotalUtilizedBudgetOfDepartment();
            break;
        case "Quit":
            connection.end();
            console.log("Closed");
            break;
    }
  });
}
