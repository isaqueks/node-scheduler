import { IOFunction } from "./dataStructures/ioFunction";
import Queue from "./dataStructures/queue";

export interface ScheduledTask<I, O> {
    input: I;
    taskId: number;
    callback: (err: any, output: O) => any;
}

export default class TaskScheduler<I, O> {

    private scheduler: Queue<ScheduledTask<I, O>>;
    public readonly maxSimultaneousTasks: number;
    private taskId: number = 0;
    private runningTasks: number = 0;

    private taskExecutor: IOFunction<I, O>;

    private checkTasks() {
        if (this.runningTasks >= this.maxSimultaneousTasks) {
            return;
        }
    
        const task = this.scheduler.pop();
        if (!task) {
            return;
        }
    
        this.runningTasks++;
    
        this.taskExecutor(task.input)
        .then(out => {
            task.callback(null, out);
        })
        .catch(err => {
            task.callback(err, null);
        })
        .finally(() => {
            this.runningTasks--;
            this.checkPendingTasks();
        });
        
    }

    private checkPendingTasks() {
        for (let i = this.runningTasks; i < this.maxSimultaneousTasks; i++) {
            this.checkTasks();
        }
    }

    constructor(maxTasks: number, taskHandler: IOFunction<I, O>,) {
        this.scheduler = new Queue<ScheduledTask<I, O>>();
        this.maxSimultaneousTasks = maxTasks;
        this.taskExecutor = taskHandler;
    }

    public schedule(input: I, callback: (err: any, out: O) => any) {
        this.scheduler.push({
            taskId: this.taskId++,
            input,
            callback
        });
        if (this.taskId >= Number.MAX_SAFE_INTEGER) {
            this.taskId = 0;
        }
        this.checkPendingTasks();
    }

}