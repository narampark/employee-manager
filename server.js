const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.user,
  password: process.env.password,
  database: "employeeTracker_db",
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
        "Add a manager",
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
        case "Add a manager":
          addManager();
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

function addManager() {
  const queryDepartments = "SELECT * FROM departments";
  const queryEmployees = "SELECT * FROM employee";

  connection.query(queryDepartments, (err, resDepartments) => {
    if (err) throw err;
    connection.query(queryEmployees, (err, resEmployees) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "list",
            name: "department",
            message: "Select department",
            choices: resDepartments.map(
              (department) => department.department_name
            ),
          },
          {
            type: "list",
            name: "employee",
            message: "Select employee to add a manager to",
            choices: resEmployees.map(
              (employee) => `${employee.first_name} ${employee.last_name}`
            ),
          },
          {
            type: "list",
            name: "manager",
            message: "Select employee's manager",
            choices: resEmployees.map(
              (employee) => `${employee.first_name} ${employee.last_name}`
            ),
          },
        ])
        .then((answers) => {
          const department = resDepartments.find(
            (department) => department.department_name === answers.department
          );
          const employee = resEmployees.find(
            (employee) =>
              `${employee.first_name} ${employee.last_name}` ===
              answers.employee
          );
          const manager = resEmployees.find(
            (employee) =>
              `${employee.first_name} ${employee.last_name}` === answers.manager
          );
          const query =
            "UPDATE employee SET manager_id = ? WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)";
          connection.query(
            query,
            [manager.id, employee.id, department.id],
            (err, res) => {
              if (err) throw err;
              console.log("manager to employee added");
              start();
            }
          );
        });
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

function updateEmployeeRole() {
  const queryEmployees =
    "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id";
  const queryRoles = "SELECT * FROM roles";
  connection.query(queryEmployees, (err, resEmployees) => {
    if (err) throw err;
    connection.query(queryRoles, (err, resRoles) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "list",
            name: "employee",
            message: "Select employee",
            choices: resEmployees.map(
              (employee) => `${employee.first_name} ${employee.last_name}`
            ),
          },
          {
            type: "list",
            name: "role",
            message: "Update employee role",
            choices: resRoles.map((role) => role.title),
          },
        ])
        .then((answers) => {
          const employee = resEmployees.find(
            (employee) =>
              `${employee.first_name} ${employee.last_name}` ===
              answers.employee
          );
          const role = resRoles.find((role) => role.title === answers.role);
          const query = "UPDATE employee SET role_id = ? WHERE id = ?";
          connection.query(query, [role.id, employee.id], (err, res) => {
            if (err) throw err;
            console.log("Updated employee's role");
            start();
          });
        });
    });
  });
}

function viewEmployeesByManager() {
  const query = `
  SELECT
  e.id,
  e.first_name,
  e.last_name,
  r.title,
  d.department_name,
  CONCAT(m.first_name, " ", m.last_name) AS manager_name
  FROM
  employee e
  INNER JOIN roles r on e.role_id = r.id
  INNER JOIN departments d ON r.department_id = d.id
  LEFT JOIN employee m ON e.manager_id = m.id
  ORDER BY
  manager_name,
  e.last_name,
  e.first_name
  `;

  connection.query(query, (err, res) => {
    if (err) throw err;

    const employeesByManager = res.reduce((acc, cur) => {
      const managerName = cur.manager_name;
      if (acc[managerName]) {
        acc[managerName.push(cur)];
      } else {
        acc[managerName] = [cur];
      }
      return acc;
    }, {});

    console.log("Employees by manager");
    for (const managerName in employeesByManager) {
      console.log(`\n${managerName}`);
      const employees = employeesByManager[managerName];
      employees.forEach((employee) => {
        console.log(
          `${employee.first_name} ${employee.last_name} | ${employee.title} | ${employee.department_name}`
        );
      });
    }

    start();
  });
}

function deleteEmployee() {
  const query = "SELECT * FROM employee";
  connection.query(query, (err, res) => {
    if (err) throw err;
    const employeeList = res.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    employeeList.push({ name: "Go Back", value: "back" });
    inquirer
      .prompt({
        type: "list",
        name: "id",
        message: "Select the employee to delete",
        choices: employeeList,
      })
      .then((answer) => {
        if (answer.id === "back") {
          deleteDepartmentsRolesEmployees();
          return;
        }
        const query = "DELETE FROM employee WHERE id = ?";
        connection.query(query, [answer.id], (err, res) => {
          if (err) throw err;
          console.log("Deleted employee");

          start();
        });
      });
  });
}

function deleteRole() {
  const query = "SELECT * FROM roles";
  connection.query(query, (err, res) => {
    if (err) throw err;

    const choices = res.map((role) => ({
      name: `${role.title} ${role.id} - ${role.salary}`,
      value: role.id,
    }));

    choices.push({ name: "Go Back", value: null });
    inquirer
      .prompt({
        type: "list",
        name: "roleId",
        message: "Select the role to be deleted",
        choices: choices,
      })
      .then((answer) => {
        if (answer.roleId === null) {
          deleteDepartmentsRolesEmployees();
          return;
        }
        const query = "DELETE FROM roles WHERE id = ?";
        connection.query(query, [answer.roleId], (err, res) => {
          if (err) throw err;
          console.log("Deleted role");

          start();
        });
      });
  });
}

function deleteDepartment() {
  const query = "SELECT * FROM departments";
  connection.query(query, (err, res) => {
    if (err) throw err;
    const departmentChoices = res.map((department) => ({
      name: department.department_name,
      value: department.id,
    }));

    inquirer
      .prompt({
        type: "list",
        name: "departmentId",
        message: "Choose the department to remove",
        choices: [...departmentChoices, { name: "Go Back", value: "back" }],
      })
      .then((answer) => {
        if (answer.departmentId === "back") {
          deleteDepartmentsRolesEmployees();
        } else {
          const query = "DELETE FROM departments WHERE id =?";
          connection.query(query, [answer.departmentId], (err, res) => {
            if (err) throw err;
            console.log("Department deleted");

            start();
          });
        }
      });
  });
}

function viewTotalUtilizedBudgetOfDepartment() {
  const query = "SELECT * FROM departments";
  connection.query(query, (err, res) => {
    if (err) throw err;
    const departmentChoices = res.map((department) => ({
      name: department.department_name,
      value: department.id,
    }));
    inquirer
      .prompt({
        type: "list",
        name: "departmentId",
        message: "Choose the department to calculate total salary for",
        choices: departmentChoices,
      })
      .then((answer) => {
        const query = `SELECT departments.department_name AS department, 
      SUM(roles.salary) AS total_salary FROM departments 
      INNER JOIN roles ON departments.id = roles.department_id
      INNER JOIN employee ON roles.id = employee.role_id
      WHERE departments.id = ?
      GROUP BY departments.id;`;
        connection.query(query, [answer.departmentId], (err, res) => {
          if (err) throw err;
          const totalSalary = res[0].total_salary;
          console.log(`Total salary`);

          start();
        });
      });
  });
}

process.on("exit", () => {
  connection.end();
});
