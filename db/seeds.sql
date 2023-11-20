INSERT INTO departments (department_name)
VALUES
("GM"),
("Human Resource"),
("Payroll"),
("Sales"),
("Customer Relations"),

INSERT INTO roles (title, salary, department_id)
VALUES
("GM", 500000.00, 1),
("Human Resources", 80000.00, 2),
("Payroll", 80000.00, 3),
("Sales", 120000.00, 4),
("Customer Relations", 80000.00, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Nate", "Park", 1, 1),
("Jenny", "Jeon", 2, 2),
("Danny", "Jeon", 3, 3),
("Maro", "Park", 4, 4),
("Joanna", "Park", 5, 5);
