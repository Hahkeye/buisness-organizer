const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'buisness'
});


function menu(){
    console.log(`
    Menu
    --------------------------------
    1. View All Deparments
    2. View All Roles
    3. View All Employees
    4. Add department
    5. Add role
    6. Add employee
    7. Update employee role.
    `);
}

async function getAll(table){
    let con = await connection;
    let t = await con.query(`SELECT * from ${table}`);
    // console.log(t[0]);
    return t[0];
}
async function addEmployee(){
    let temp = [];
    for(let i of await getAll('buisness.role')){
        console.log(i['title']);
        temp.push({name: i['title'],value: i['id']});
    }
    // console.log(temp)
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the Employee\'s first name?'
        },
        {
            type: 'input',
            name: 'lname',
            message: 'What is the Employee\'s last name?'
        },
        {
            type: 'list',
            name: 'roleID',
            message: 'What role is this person in?',
            choices: temp
        },
        {
            type: 'number',
            name: 'manager',
            message: 'What is the manager id of this person?'
        }
    ]);
}

async function addDepartment(){
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the Department name?'
        },

    ]);
}

async function addRole(){
    let temp = [];
    let t = getAll("buisness.department");
    for(let i of t){
        temp.push({name: i['name'],value: i['id']});
    }
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'What is the title of this role?'
        },
        {
            type: 'number',
            name: 'salary',
            message: 'What is the salary of this role?'
        },
        {
            type: 'list',
            name: 'department',
            message: 'What department is this role under?',
            choices: temp
        }
    ]);
}



async function getDepartments(){ //mayb refactor these getters to just query the db with the string and not have 3 fucntions
    let t = await getAll('buisness.department');
    if(t){
        return t;
    }
}

async function getEmployees(){
    let t = await getAll('buisness.employee');
    if(t){
        return t;
    }
}

async function getRoles(){
    let t = await getAll('buisness.role')
    if(t){
        return t;
    }
}

async function editEmployee(){
    let temp2 = [];
    for(let i of await getAll('buisness.role')){
        console.log(i['title']);
        temp2.push({name: i['title'],value: i['id']});
    }
    let temp=[];
    let t = await getEmployees();
    console.log(t);
    for(let i of t){
        temp.push({name: i['first_name'],value: i['id']});
    }
    return await inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: 'What employee would you like to edit?',
            choices: temp
        },
        {
            type: 'list',
            name: 'title',
            message: 'What role would you like to change to?',
            choices: temp2
        }
    ]); 
}

async function main(){
    let sel=null
    while(true){
        menu();
        try{
            sel = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'selection',
                    message: 'What is your Selection?'
                }
            ]);
        }catch(e){
            console.log("Erorr ",e);
        }
        // console.log(sel);
        switch(sel['selection']){
            case 1:
                let deps = await getDepartments();
                // console.log(deps);
                console.log(`Department Name|Department Number`);
                for(let i of deps){
                    console.log(`${i.name}|${i.id}`);
                }
                break;
            case 2:
                let roles = await getRoles();
                console.log(`RoleID|Role Title|Role Salary|Role department ID`);
                for(let i of roles){
                    console.log(`ID: ${i.id} | Title: ${i.title} |  Salary: ${i.salary} | DepId: ${i.department_id}`);
                }
                break;
            case 3:
                let emp = await getEmployees();
                console.log(`Employe Name|Employee LastName|Role|Manager`);
                for(let i of emp){
                    console.log(`Name: ${i.first_name}|Last Name: ${i.last_name}| RoleID ${i.role_id}| MangerID ${i.manager_id} | ID ${i.id}`);
                }
                break;
            case 4:
                let temp2 =  await addDepartment();
                console.log(temp2);
                let con5 = await connection;
                let t6 = await con5.execute(`INSERT INTO buisness.department (name) VALUES ('${temp2.name}');`);
                break;
            case 5:
                let temp3 = await addRole();
                console.log(temp3);
                let con2 = await connection;
                let t2 = await con2.execute(`INSERT INTO buisness.role (title, salary, department_id) VALUES ('${temp3.title}','${temp3.salary}','${temp3.department}');`);
                break;
            case 6:
                let temp = await addEmployee();
                console.log(temp);
                let con = await connection;
                let t = await con.execute(`INSERT INTO buisness.employee (first_name, last_name, role_id, manager_id) VALUES ('${temp.name}','${temp.lname}','${temp.roleID}','${temp.manager}');`);
                // console.log(t);
                break;
            case 7:
                let a = await editEmployee();
                console.log(a);
                let con6 = await connection;
                let asd = await con6.execute(`UPDATE buisness.employee SET role_id = ${a.title} WHERE id = ${a.employee};`);
                
                break;
        }
    }
}

main();