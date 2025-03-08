// Servis sınıflarını export et
export { BaseService } from './BaseService';
export { TaskService } from './TaskService';
export { ProjectService } from './ProjectService';
export { CommentService } from './CommentService';
export { AttachmentService } from './AttachmentService';
export { SprintService } from './SprintService';
export { TeamService } from './TeamService';

// Servis sınıflarının örneklerini oluştur
import { TaskService } from './TaskService';
import { ProjectService } from './ProjectService';
import { CommentService } from './CommentService';
import { AttachmentService } from './AttachmentService';
import { SprintService } from './SprintService';
import { TeamService } from './TeamService';

// Singleton servis örnekleri
export const taskService = new TaskService();
export const projectService = new ProjectService();
export const commentService = new CommentService();
export const attachmentService = new AttachmentService();
export const sprintService = new SprintService();
export const teamService = new TeamService();