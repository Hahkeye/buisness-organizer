const inquirer = require('inquirer');
const DBhelper = require('./helpers/dbhelper');
const cTable = require('console.table');

// add .env
const connection = new DBhelper({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'buisness'
});

//The main menu print, should toatlly be done in one prompt but here we are
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
    8. view employees by group
    9. Exit
    `);
}
//Fuction to add an employee                                                FIX THIS
async function addEmployee(){//could refactor to just shove name and value in the returend 
    // let temp = [];
    let x = await connection.get('buisness.role');
    let y = await connection.get('buisness.employee');
    for(let i of x){
        // console.log(i['title']);
        // temp.push({name: i['title'],value: i['id']});
        i['name']=i['title'];
        i['value']=i['id'];
    }
    for(let i in y){
        y[i]['name']=y[i]['first_name'];
        y[i]['value']=y[i]['id'];
    }
    y.push({name: "None", value: "null"});

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
            choices: x
        },
        {
            type: 'list',
            name: 'manager',
            message: 'What is the manager id of this person?',
            choices: y
        }
    ]);
}
//Function to add a department. All we ask is for is the name
async function addDepartment(){
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the Department name?'
        }

    ]);
}
//Function to add a role. Only ask for name title and department its under. We only allow them to enter already existing departments
async function addRole(){
    let temp = [];
    let t = await connection.get("buisness.department");
    for(let i of t){
        temp.push({name: i['name'],value: i['id']});//Change this to just shove the stuff into the current array of dictionary
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


async function edit(){//very overcomplicated edit function
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
    let targets = [];
    let keyl = null;
    for(let i in records){//manipulate the data to add to the choices in the theycan select from
        console.log();
        let keys = Object.keys(records[i]);
        let id = records[i]['id'];
        keys.shift();
        keyl=keys;
        let temp = "";
        keys.forEach(x => temp+=` ${x}: ${records[i][x]} |`);
        targets.push({name: temp,value: id});
    }
    let sel2 = await inquirer.prompt(
        {
            type: 'list',
            name: 'target',
            message: 'Which one would you like to edit?',
            choices: targets
        }
    );
    let sel3 = await inquirer.prompt(
        {
            type: 'list',
            name: 'field',
            message: 'Which one would you like to edit?',//Need to ask about params
            choices: keyl  
        }

    );
    if(tables.includes(sel3.field.split("_")[0])){  //decect if this s a field we already track and then get all those so they can choose form it.
        let valus = await connection.get(sel3.field.split("_")[0]);
        let targets2=[];
        for(let i in valus){
            let keys = Object.keys(valus[i]);
            let id = valus[i]['id'];
            keys.shift();
            keyl=keys;
            let temp = "";
            keys.forEach(x => temp+=` ${x}: ${valus[i][x]} |`);
            targets2.push({name: temp,value: id});
        }
        let sel4 = await inquirer.prompt(
            {
                type: 'list',
                name: 'value',
                message: 'Which one would you like to edit?',//Need to ask about params
                choices: targets2  
            }
    
        ); 
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
        // console.log(sel4);
        console.table(sel4);
        await connection.edit(sel1.table,sel3.field,`"${sel4.value}"`,sel2.target);
        
    }
}
//search function
async function search(){//view employees by manager or department
    let sel1 = await inquirer.prompt([
        {
            type: 'list',
            name: 'se',
            message: 'What would you like to view employees by?',
            choices: [
                {name:"By manager",value: 'employee_manager'},
                {name:"By department",value: 'role_id'},
            ]
        }
    ]);
    //department is  just role I guess
    if(sel1.se=='role_id'){
        let options = await connection.get('department');
        for(let i in options){
            options[i]['value']=options[i]['id'];
        }
        let sel2 = await inquirer.prompt([
            {
                type: 'list',
                name: 'sel',
                message: 'What role would you like to search by?',
                choices: options
            }
        ]);
        let results=[];
        let temp2 = await connection.search('role',['id'],'department_id',sel2.sel);
        for(let i in temp2){
            let temp = await connection.search("employee",["first_name","id"],"role_id",temp2[i]['id']);
            for(let i in temp){
                results.push(temp[i]);
            }
        }
        console.table(results);
    }else{
        let options = await connection.get('employee');
        for(let i in options){
            options[i]['name']=options[i]['first_name'];
            options[i]['value']=options[i]['id'];
        }
        let sel2 = await inquirer.prompt([
            {
                type: 'list',
                name: 'sel',
                message: 'What manager would you like to sort by?',
                choices: options
            }
        ]);
        let temps = []
        for(let i of options){
            if(i['employee_manager']==sel2.sel){
                temps.push(i);
            }
        }
        console.table(temps)
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
        switch(sel['selection']){
            case 1:
                let dat = await connection.get('buisness.department')
                console.table(dat);
                break;
            case 2:
                let roles = await connection.get('buisness.role');
                console.table(roles);
                break;
            case 3:
                let emp = await connection.get('buisness.employee');
                console.table(emp);
                break;
            case 4:
                let temp2 =  await addDepartment();
                connection.insert('buisness.department','name',[temp2.name]);
                break;
            case 5:
                let temp3 = await addRole();
                connection.insert('buisness.role',['title','salary','department_id'],[temp3.title,temp3.salary,temp3.department]);
                break;
            case 6:
                let temp = await addEmployee();
                console.log(temp);
                connection.insert('buisness.employee',['first_name','last_name','role_id','employee_manager'],[temp.name,temp.lname,temp.roleID,temp.manager]);
                break;
            case 7:
                let a = await edit();
                break;
            case 8:
                let t = await search();
                break;
            case 9:
                process.exit(1);
                break;
        }
    }
}

main();