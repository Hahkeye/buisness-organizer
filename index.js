const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'buisness'
});

// connection.query(
//     'SELECT * FROM buisness.employee',
//     function(err, results, fields) {
//       console.log(results); // results contains rows returned by server
//       console.log(fields); // fields contains extra meta data about results, if available
//       console.log(err);
//     }
//   );

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

async function addEmployee(){
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

        }
    ]);
}

async function getDepartments(){
    let con = await connection;
    con= await con.query('SELECT * from buisness.department');
    console.log(con[0]);
    if(con){
        return con[0];
    }
}

async function getEmployees(){
    let con = await connection;
    con = await con.query('SELECT * from buisness.employee');
    console.log(con[0]);
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
                break;
            case 3:
                let emp = await getEmployees();
                console.log(`Employe Name|Employee LastName|Role|Manager`);
                for(let i of emp){
                    console.log(`Name: ${i.first_name}|Last Name: ${i.last_name}| RoleID ${i.role_id}| MangerID ${i.manager_id} | ID ${i.id}`);
                }
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                addEmployee();
                break;
            case 7:
                break;
        }
    }
}

main();