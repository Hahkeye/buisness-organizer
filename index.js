// const mysql = require('mysql2/promise');
const { info } = require('console');
const e = require('express');
const inquirer = require('inquirer');
const DBhelper = require('./helpers/dbhelper');

const connection = new DBhelper({
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
    7. Update entry.
    9. view employees by group
    10. delete something
    11. search something
    `);
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
        }

    ]);
}

async function addRole(){
    let temp = [];
    let t = await connection.get("buisness.department");
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


async function edit(){
    let tables = await connection.tables();
    let sel1= await inquirer.prompt(
        {
            type: 'list',
            name: 'table',
            message: 'What would you like to edit?',
            choices: tables
        }
    );
    let records = await connection.get(sel1.table);//all values in the table
    // console.log(sel1);//target table
    let targets = [];
    let keyl = null;
    for(let i in records){
        console.log();
        let keys = Object.keys(records[i]);
        let id = records[i]['id'];
        keys.shift();
        keyl=keys;
        let temp = "";
        keys.forEach(x => temp+=` ${x}: ${records[i][x]} |`);
        targets.push({name: temp,value: id});
    }
    // console.log(targets);
    let sel2 = await inquirer.prompt(
        {
            type: 'list',
            name: 'target',
            message: 'Which one would you like to edit?',
            choices: targets
        }
    );
    // console.log(sel2);
    let sel3 = await inquirer.prompt(
        {
            type: 'list',
            name: 'field',
            message: 'Which one would you like to edit?',//Need to ask about params
            choices: keyl  
        }

    );
    if(tables.includes(sel3.field.split("_")[0])){
        let valus = await connection.get(sel3.field.split("_")[0]);
        let targets2=[];
        for(let i in valus){
            console.log();
            let keys = Object.keys(valus[i]);
            let id = valus[i]['id'];
            keys.shift();
            keyl=keys;
            let temp = "";
            keys.forEach(x => temp+=` ${x}: ${valus[i][x]} |`);
            targets2.push({name: temp,value: id});
        }
        // console.log(valus);
        let sel4 = await inquirer.prompt(
            {
                type: 'list',
                name: 'value',
                message: 'Which one would you like to edit?',//Need to ask about params
                choices: targets2  
            }
    
        ); 
        // console.log(sel4);
        await connection.edit(sel1.table,sel3.field,sel4.value,sel2.target);
    }else{
        // console.log("Let user input");
        let sel4 = await inquirer.prompt(
            {
                type: 'input',
                name: 'value',
                message: 'Which one would you like change to?',//Need to ask about params
            }
    
        ); 
        console.log(sel4);
        await connection.edit(sel1.table,sel3.field,`"${sel4.value}"`,sel2.target);
        
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
                let dat = await connection.get('buisness.department')
                console.log(dat);
                connection.info('buisness.department');
                break;
            case 2:
                let roles = await connection.get('buisness.role');
                connection.info('buisness.role');
                console.log(`RoleID|Role Title|Role Salary|Role department ID`);
                for(let i of roles){
                    console.log(`ID: ${i.id} | Title: ${i.title} |  Salary: ${i.salary} | DepId: ${i.department_id}`);
                }
                break;
            case 3:
                let emp = await connection.get('buisness.employee');
                console.log(`Employe Name|Employee LastName|Role|Manager`);
                for(let i of emp){
                    console.log(`Name: ${i.first_name}|Last Name: ${i.last_name}| RoleID ${i.role_id}| MangerID ${i.manager_id} | ID ${i.id}`);
                }
                break;
            case 4:
                let temp2 =  await addDepartment();
                console.log(temp2);
                connection.insert('buisness.department','name',[temp2.name]);
                break;
            case 5:
                let temp3 = await addRole();
                console.log(temp3);
                connection.insert('buisness.role',['title','salary','department_id'],[temp3.title,temp3.salary,temp3.department]);
                break;
            case 6:
                let temp = await addEmployee();
                console.log(temp);
                connection.insert('buisness.employee',['first_name','last_name','role_id','manager_id'],[temp.name,temp.lname,temp.roleID,temp.manager]);
                // console.log(t);
                break;
            case 7:
                let a = await edit();
                console.log(a);
                break;
            case 8:

                break;
        }
    }
}

main();