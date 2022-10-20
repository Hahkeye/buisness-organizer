const mysql = require('mysql2/promise');
class Field{
    constructor(blob){
        this
    }
}


class DBhelper{

    constructor(consetup){
        this.connection = mysql.createConnection(consetup);
    }

    async get(table){
        let temp = await (await this.connection).query(`SELECT * from ${table}`);
        return temp[0];//need to listify the dictionary and make the id and the name the first two things so you can display it
    }
    async insert(table,data,values){
        // console.log(table);
        // console.log(values);
        values = Object.values(values).map(val=>`"${val}"`)
        // console.log(data);
        // console.log(`INSERT INTO ${table} (${data}) VALUES (${values});`);//add "?" before all string literals so mysql does nice things
        let temp = await (await this.connection).execute(`INSERT INTO ${table} (${data}) VALUES (${values});`)
    }

    async edit(table,changeField,changeValue,target){
        let temp = await(await this.connection).execute(`UPDATE ${table} set ${changeField} = ${changeValue} WHERE id = ${target}`);
    }
    async info(table){
        let temp = await(await this.connection).query(`SHOW COLUMNS FROM ${table}`);
        let t = temp[0].map(x => [x['Field'],x['Type'],x['Key']]);
        return t;
        
    }

    async tables(){
        let temp = await(await this.connection).query('SHOW TABLES');
        return temp[0].map(val => val['Tables_in_buisness']);
    }

    async search(type,fields,field,value){
        let temp = await(await this.connection).query(`SELECT ${fields} FROM ${type} WHERE ${field} = ${value}`);
        return temp[0];

    }

    async words(blob){
        let temp = await(await this.connection).query(`SELECT ${fields} FROM ${type} WHERE ${field} = ${value}`);
        return temp[0];
    }

}

module.exports = DBhelper;