const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();

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
  inquirer
    .prompt({
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
          addDepartment();
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

function viewAllDepartments() {
  const query = "SELECT * FROM departments";
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function viewAllRoles() {
  const query =
    "SELECT roles.title, roles.id, departments.department_name, roles.salary from roles join departments on roles.department_id = departments.id";
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function viewAllEmployees() {
  const query = `SELECT e.id, e.first_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager_name FROM employee e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      name: "name",
      message: "Enter the name of the department",
    })
    .then((answer) => {
      console.log(answer.name);
      const query = `INSERT INTO departments (department_name) VALUES ("${answer.name}")`;
      connection.query(query, (err, res) => {
        if (err) throw err;
        console.log(`${answer.name} department added to database`);
        start();
        console.log(answer.name);
      });
    });
}

function addRole() {
  const query = "SELECT * FROM departments";
  connection.query(query, (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "Enter the title of the role",
        },
        {
          type: "input",
          name: "salary",
          message: "Enter salary amount",
        },
        {
          type: "list",
          name: "department",
          message: "Select the department of the role",
          choices: res.map((department) => department.department_name),
        },
      ])
      .then((answers) => {
        const department = res.find(
          (department) => department.name === answers.department
        );
        const query = "INSERT INTO roles SET ?";
        connection.query(
          query,
          {
            title: answers.title,
            salary: answers.salary,
            department_id: department,
          },
          (err, res) => {
            if (err) throw err;
            console.log("Added role, salary, and department to database");
            start();
          }
        );
      });
  });
}

function addEmployee() {
  connection.query("SELECT id, title FROM roles", (err, res) => {
    if (err) {
      console.error(err);
      return;
    }

    const roles = results.map(({ id, title }) => ({
      name: title,
      value: id,
    }));

    connection.query(
      "SELECT id, CONCAT(first_name, '', last_name) AS name FROM employee",
      (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
        const managers = results.map(({ id, name }) => ({
          name,
          value: id,
        }));

        inquirer
          .prompt([
            {
              type: "input",
              name: "firstName",
              message: "Enter employee's first name",
            },
            {
              type: "input",
              name: "lastName",
              message: "Enter employee's last name",
            },
            {
              type: "list",
              name: "roleId",
              message: "Select employee role",
              choices: roles,
            },
            {
              type: "list",
              name: "managerId",
              message: "Select employee manager",
              choices: [{ name: "None", value: null }, ...managers],
            },
          ])
          .then((answers) => {
            const sql =
              "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
            const values = [
              answers.firstName,
              answers.lastName,
              answers.roleId,
              answers.managerId,
            ];
            connect.query(sql, values, (err) => {
              if (err) {
                console.error(err);
                return;
              }

              console.log("Employee added");
              start();
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }
    );
  });
}

