import type { Task } from '../entities/Task.js';

export interface ITaskRepository {
    findByGroupId(groupId: string): Promise<Task[]>;
    findById(taskId: string): Promise<Task | null>;
    save(task: Task): Promise<Task>;
    delete(taskId: string): Promise<void>;
}
