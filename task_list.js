#!/usr/bin/bun
import { parseArgs } from "util";
import { existsSync, statSync } from "node:fs";
import { join } from 'node:path';
// Constants Globales
const DEV = true;

// Utils
function convertirATextoAObjeto(str) {
    try{
        const obj = {};
        str.split(' ').filter(linea => linea.trim() !== '').forEach(item => {
            const [key, value] = item.split(':');
            obj[key] = value;
        });
        return obj;
    }catch(e){
       
        console.log("string: ",str)
        throw new Error("Error al convertir texto a objeto");
    }
}
function convertirObjetoATexto(obj) {
    return Object.entries(obj).map(([key, value]) => `${key}:${value}`).join(' ');
}
function obtenerNumeroDeString(str) {
    if(!str) return null;
    if(typeof str !== 'string') return null
    const numeroEncontrado = str.match(/\d+/);
    return numeroEncontrado ? parseInt(numeroEncontrado[0], 10) : null;
}

async function runCommand(command){
    if(!command) throw new Error("No se ingresó un comando");
    if(DEV){
        console.log("Comando: ", command);
        return;
    };
    const process = Bun.spawn(command);
    const response = await new Response(process.stdout).text();
    return response;
}
  

// CLASES

class MainTask{
    constructor(crude_text){
        this.crude_text = crude_text;
        this.lines = this.crude_text.split("\n").filter(linea => linea.trim() !== '');
        this.title = "";
        this.parameters = {};
        this.racks = [];
        this.id = "";
        this.tasks = [];
        this.depends = [];
    }
    _build_title(){
        this.title = this.lines[0];
    };
    _build_parameters(){
        this.parameters = convertirATextoAObjeto(this.lines[1]);
    };
    _build_racks(){
        this.racks = this.crude_text.split("\n.").filter(str => str.trim() !== '').slice(1);
    };
    async _run_racks(){
        for (let index = 0; index < this.racks.length; index++) {
            const rack = this.racks[index];
            const rack_task = new RackTask(rack, this);
            await rack_task.run();
            this.tasks = [...this.tasks, ...rack_task.tasks];
        }
    }
    _build_depends(){
        this.depends = this.tasks.map(task => task.id);
    }
    async _run_main_task(){
        const task = new Task(this.title, this.parameters);
        await task.run(this.depends);
    }
    async run(){
        this._build_title();
        this._build_parameters();
        this._build_racks();
        await this._run_racks();
        this._build_depends();
        await this._run_main_task();
        console.log("Tareas Creadas");

    }
    
    
}

class Task {
    constructor(title, parameters){
        this.title = title;
        this.parameters = parameters;
    }
    _cmd_build(depends){
        if(depends) this.parameters.depends = depends;
        const params = convertirObjetoATexto(this.parameters);
        
        const cmd = ["task", "add", `"${this.title}"`, ...params.split(' ')]; 
        return cmd;
    }
    _validate_output_command(output){
        if(DEV) return true;
        let validate = false;
        let text_confirmation = "Created task";
        if(output.includes(text_confirmation)) validate = true;
        
        return validate;
    }
    async run(depends){
        const cmd = this._cmd_build(depends)
        const task_warrior_output = await runCommand(cmd);
        console.log( this.title,": ", task_warrior_output);
        if(!this._validate_output_command(task_warrior_output)) throw new Error(`Error al crear tarea ${this.title}`);
        this.id = obtenerNumeroDeString(task_warrior_output);
    }
}
class RackTask{
    constructor(rack, main_task){
        this.rack = rack; // String
        this.main_task = main_task; // MainTask
        this.parameters = main_task.parameters; // Object
        this.tasks = []; // Array<Task>
        this.first_line_split = this.rack.split("\n")[0].split(" ");   
    }
    _build_parameters_rack(){
        const parameters_rack = 
            this.first_line_split.length > 1 ? // Si hay más de un elemento en el array significa que hay parámetros porque el primer elemento es el título 
                convertirATextoAObjeto(this.first_line_split.slice(1).join(" "))
                : 
                {};
        this.parameters = {...this.parameters, ...parameters_rack};
        const project_rack = this.first_line_split[0];
        if(project_rack)
            this.parameters.project = `${this.main_task.parameters.project}.${project_rack}`;
        
    };
    _build_tasks(){
        const tasks = this.rack.split("\n").slice(1).filter(str => str.trim() !== '');
        if(tasks.length === 0) throw new Error("No hay tareas en el rack");
        this.tasks = tasks.map(title => {
            return new Task(title, this.parameters);
        });
    };
    _build_project(){
        return `${this.main_task.parameters.project}${this.project_rack ? `.${this.project_rack}` : ""}`;
    }
    async run(){
        try{
            this._build_parameters_rack();
            this._build_tasks();
            
            for (let index = 0; index < this.tasks.length; index++) {
                const task = this.tasks[index];
                const depends = index > 0 ? this.tasks[index - 1].id : null;
                await task.run(depends);
            }
            console.log("Rack terminado");
        }catch(e){
            this._error(e);
        }
    }
    _error(e){
        console.log("Error en el rack");
        console.log(e);
    }
    
}



// MAIN CODE
const {values:input, positionals} = parseArgs({
    args: Bun.argv,
    options: {
        file:{
            type: "string",
        }
    },
    strict: true,
    allowPositionals: true,
});
if(!input.file) throw new Error("No se ingresó un archivo");
if(!existsSync(input.file)) throw new Error("El archivo no existe");
 
const FILE = Bun.file(input.file);
let text = await FILE.text();

const main_task = new MainTask(text);
main_task.run()