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
    // let con = await connection;
    // con = await con.query('SELECT * from buisness.department')
    // console.log(con[0]);
    let temp = [];
    for(let i of await getAll("buisness.department")){
        // console.log(i['title']);
        temp.push({name: i['name'],value: i['id']});
    }
    // console.log(temp)
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
    let con = await connection;
    con = await con.query('SELECT * from buisness.employee');
    // console.log(con[0]);
    if(con){
        return con[0];
    }
}

async function getRoles(){
    let con = await connection;
    con = await con.query('SELECT * from buisness.role')
    // console.log(con[0])
    if(con){
        return con[0];
    }
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
                break;
            case 5:
                let temp3 = await addRole();
                console.log(temp3);
                break;
            case 6:
                let temp = await addEmployee();
                console.log(temp);
                break;
            case 7:
                break;
        }
    }
}

main();