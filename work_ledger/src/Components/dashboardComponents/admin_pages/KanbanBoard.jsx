
// import React, { Component } from 'react';
// import axios from 'axios';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// import { API_BASE_URL } from '../../../Config/config';
// // import './kanban.css';

// export default class KanbanBoard extends Component {

//     state = {
//         tasks: {},
//         columns: {
//             'To Do': { id: 'To Do', title: 'To Do', taskIds: [] },
//             'In Progress': { id: 'In Progress', title: 'In Progress', taskIds: [] },
//             'In Review': { id: 'In Review', title: 'In Review', taskIds: [] },
//             'Done': { id: 'Done', title: 'Done', taskIds: [] },
//         },
//         columnOrder: ['To Do', 'In Progress', 'In Review', 'Done'],
//         projectName: '',
//         showModal: false,
//         selectedTask: null,
//         newNote: ''
//     };

//     componentDidMount() {
//         this.fetchTasks();
//     }

//     fetchTasks = () => {
//         axios.get(`${API_BASE_URL}/work_ledger/kanbanBoard.php?list=1`)
//             .then(res => {

//                 const data = Array.isArray(res.data) ? res.data : [];

//                 const tasks = {};
//                 const columns = {
//                     'To Do': { id: 'To Do', title: 'To Do', taskIds: [] },
//                     'In Progress': { id: 'In Progress', title: 'In Progress', taskIds: [] },
//                     'In Review': { id: 'In Review', title: 'In Review', taskIds: [] },
//                     'Done': { id: 'Done', title: 'Done', taskIds: [] },
//                 };

//                 let projectName = '';

//                 data.forEach(t => {
//                     if (!t.task_id || !t.status) return;

//                     const id = String(t.task_id);

//                     tasks[id] = {
//                         id,
//                         title: t.task_name,
//                         status: t.status,
//                         user: t.user_name,
//                         dueDate: t.due_date,
//                         notes: t.notes ? [{ note: t.notes }] : []
//                     };

//                     if (columns[t.status]) {
//                         columns[t.status].taskIds.push(id);
//                     }

//                     if (!projectName && t.project_name) {
//                         projectName = t.project_name;
//                     }
//                 });

//                 this.setState({ tasks, columns, projectName });
//             })
//             .catch(err => console.error(err));
//     };

//     onDragEnd = result => {
//         const { source, destination, draggableId } = result;
//         if (!destination) return;

//         const start = this.state.columns[source.droppableId];
//         const finish = this.state.columns[destination.droppableId];
//         if (start === finish) return;

//         axios.put(`${API_BASE_URL}/work_ledger/kanbanBoard.php`, {
//             task_id: draggableId,
//             task_name: this.state.tasks[draggableId].title,
//             status: finish.id,
//             due_date: this.state.tasks[draggableId].dueDate,
//         });

//         const startIds = Array.from(start.taskIds);
//         startIds.splice(source.index, 1);
//         const finishIds = Array.from(finish.taskIds);
//         finishIds.splice(destination.index, 0, draggableId);

//         this.setState({
//             columns: {
//                 ...this.state.columns,
//                 [start.id]: { ...start, taskIds: startIds },
//                 [finish.id]: { ...finish, taskIds: finishIds },
//             },
//         });
//     };

//     openModal = task => {
//         this.setState({ selectedTask: { ...task }, showModal: true, newNote: '' });
//     };

//     closeModal = () => {
//         this.setState({ showModal: false, selectedTask: null });
//     };

//     handleChange = e => {
//         const { name, value } = e.target;
//         this.setState({
//             selectedTask: { ...this.state.selectedTask, [name]: value }
//         });
//     };

//     // submitNote = e => {
//     //     e.preventDefault();

//     //     axios.put(`${API_BASE_URL}/work_ledger/kanbanBoard.php`, {
//     //         task_id: this.state.selectedTask.id,
//     //         note: this.state.newNote
//     //     }).then(() => {
//     //         this.closeModal();
//     //         this.fetchTasks();
//     //     });
//     // };

//     submitNote = e => {
//         e.preventDefault();

//         axios.put(`${API_BASE_URL}/work_ledger/kanbanBoard.php`, {
//             task_id: this.state.selectedTask.id,
//             note: this.state.newNote
//         }).then(() => {

//             this.setState(prev => ({
//                 tasks: {
//                     ...prev.tasks,
//                     [prev.selectedTask.id]: {
//                         ...prev.tasks[prev.selectedTask.id],
//                         notes: [
//                             ...prev.tasks[prev.selectedTask.id].notes,
//                             { note: prev.newNote }
//                         ]
//                     }
//                 },
//                 showModal: false,
//                 selectedTask: null,
//                 newNote: ''
//             }));
//         });
//     };

//     render() {
//         return (
//             <div className="container-fluid mt-4">
//                 <DragDropContext onDragEnd={this.onDragEnd}>
//                     <h3 className="fw-bold mb-3">{this.state.projectName}</h3>
//                     <div className="row">
//                         {this.state.columnOrder.map(colId => {
//                             const column = this.state.columns[colId];
//                             const tasks = column.taskIds.map(id => this.state.tasks[id]);
//                             return (
//                                 <Column
//                                     key={colId}
//                                     column={column}
//                                     tasks={tasks}
//                                     openModal={this.openModal}
//                                 />
//                             );
//                         })}
//                     </div>
//                 </DragDropContext>

//                 {this.state.showModal && (
//                     <Modal
//                         task={this.state.selectedTask}
//                         newNote={this.state.newNote}
//                         onChange={e => this.setState({ newNote: e.target.value })}
//                         onClose={this.closeModal}
//                         onSubmit={this.submitNote}
//                     />
//                 )}

//             </div>
//         );
//     }
// }


// const Column = ({ column, tasks, openModal }) => (
//     <div className="col-lg-3">
//         <div className="kanban-header">{column.title}</div>

//         <Droppable droppableId={column.id}>
//             {p => (
//                 <div ref={p.innerRef} {...p.droppableProps} className="kanban-column">
//                     {tasks.map((task, index) => (
//                         <Task key={task.id} task={task} index={index} onClick={openModal} />
//                     ))}
//                     {p.placeholder}
//                 </div>
//             )}
//         </Droppable>
//     </div>
// );

// const Task = ({ task, index, onClick }) => (
//     <Draggable draggableId={task.id} index={index}>
//         {p => (
//             <div
//                 ref={p.innerRef}
//                 {...p.draggableProps}
//                 {...p.dragHandleProps}
//                 className="kanban-card"
//                 onClick={() => onClick(task)}
//             >
//                 <div className="card-title">{task.title}</div>
//                 <div className="card-meta">
//                     <span>👤 {task.user}</span>
//                     <span>📅 {task.dueDate}</span>

//                 </div>
//                 <div className="mt-2">
//                     <strong>Notes:</strong>
//                     {task.notes.length === 0 && <div className="text-muted">No notes</div>}
//                     {task.notes.map((n, i) => (
//                         <div key={i}>📝 {n.note}</div>
//                     ))}
//                 </div>
//                 {/* <div className="avatar">{task.initials}</div> */}
//             </div>
//         )}
//     </Draggable>
// );

// const Modal = ({ task, newNote, onChange, onClose, onSubmit }) => (
//     <div className="modal-backdrop">
//         <div className="modal-box">
//             <form onSubmit={onSubmit}>
//                 <h5>{task.title}</h5>

//                 <label>Existing Notes</label>
//                 <div className="mb-2">
//                     {task.notes.length === 0 && (
//                         <div className="text-muted">No notes yet</div>
//                     )}
//                     {task.notes.map((n, i) => (
//                         <div key={i} className="mb-1">
//                             📝 {n.note}
//                         </div>
//                     ))}
//                 </div>

//                 <label>Add New Note</label>
//                 <textarea
//                     value={newNote}
//                     onChange={onChange}
//                     className="form-control"
//                     rows="3"
//                     required
//                 />

//                 <div className="modal-actions mt-3">
//                     <button type="submit" className="save">
//                         Submit
//                     </button>
//                     <button type="button" className="btn btn-danger" onClick={onClose}>
//                         Cancel
//                     </button>
//                 </div>
//             </form>
//         </div>
//     </div>
// );



import React, { Component } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { API_BASE_URL } from '../../../Config/config';
import { event } from 'jquery';

export default class KanbanBoard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            projects: [],
            selectedProjectId: null,
            projectName: '',

            tasks: {},
            columns: {
                'To Do': { id: 'To Do', title: 'To Do', taskIds: [] },
                'In Progress': { id: 'In Progress', title: 'In Progress', taskIds: [] },
                'In Review': { id: 'In Review', title: 'In Review', taskIds: [] },
                'Done': { id: 'Done', title: 'Done', taskIds: [] },
            },
            columnOrder: ['To Do', 'In Progress', 'In Review', 'Done'],

            showModal: false,
            selectedTask: null,
            newNote: '',
            file: null

        };
        this.fileInput = React.createRef()
    }

    componentDidMount() {
        this.fetchProjects();
    }



    fetchProjects = () => {
        axios
            .get(`${API_BASE_URL}/work_ledgerr/kanbanBoard.php?projects=1`)
            .then(res => {
                const projects = Array.isArray(res.data) ? res.data : [];

                this.setState(
                    { projects },
                    () => {
                        if (projects.length > 0) {
                            this.selectProject(projects[0]);
                        }
                    }
                );
            })
            .catch(err => console.error(err));
    };

    selectProject = project => {
        this.setState(
            {
                selectedProjectId: project.project_id,
                projectName: project.project_name
            },
            () => this.fetchTasks(project.project_id)

        );
    };


    fetchTasks = projectId => {
        axios
            .get(
                `${API_BASE_URL}/work_ledgerr/kanbanBoard.php?list=1&project_id=${projectId}`
            )
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];

                const tasks = {};
                const columns = {
                    'To Do': { id: 'To Do', title: 'To Do', taskIds: [] },
                    'In Progress': { id: 'In Progress', title: 'In Progress', taskIds: [] },
                    'In Review': { id: 'In Review', title: 'In Review', taskIds: [] },
                    'Done': { id: 'Done', title: 'Done', taskIds: [] },
                };

                data.forEach(t => {
                    if (!t.task_id || !t.status) return;

                    const id = String(t.task_id);

                    tasks[id] = {
                        id,
                        title: t.task_name,
                        status: t.status,
                        user: t.user_name,
                        dueDate: t.due_date,
                        notes: t.notes
                            ? t.notes.split('||').map(n => {
                                const [nid, text, status] = n.split('::');
                                return { id: nid, note: text, completed: status };
                            })
                            : [],

                        file: t.file
                            ? t.file.split('||').map(f => ({ filename: f }))
                            : []


                    };

                    if (columns[t.status]) {
                        columns[t.status].taskIds.push(id);
                    }
                });

                this.setState({ tasks, columns });
            })
            .catch(err => console.error(err));
    };


    onDragEnd = result => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        const start = this.state.columns[source.droppableId];
        const finish = this.state.columns[destination.droppableId];
        if (start === finish) return;

        axios.put(`${API_BASE_URL}/work_ledgerr/kanbanBoard.php`, {
            task_id: draggableId,
            status: finish.id
        });

        const startIds = Array.from(start.taskIds);
        startIds.splice(source.index, 1);

        const finishIds = Array.from(finish.taskIds);
        finishIds.splice(destination.index, 0, draggableId);

        this.setState({
            columns: {
                ...this.state.columns,
                [start.id]: { ...start, taskIds: startIds },
                [finish.id]: { ...finish, taskIds: finishIds }
            }
        });
    };


    openModal = task => {
        this.setState({ selectedTask: task, showModal: true, newNote: '' });
    };

    closeModal = () => {
        this.setState({ showModal: false, selectedTask: null });
    };

    submitNote = e => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('task_id', this.state.selectedTask.id);
        formData.append('note', this.state.newNote);

        if (this.state.file) {
            formData.append('file', this.state.file);
        }
        axios
            .post(`${API_BASE_URL}/work_ledgerr/kanbanBoard.php`,
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
            )
            .then(() => {
                this.setState(prev => ({
                    tasks: {
                        ...prev.tasks,
                        [prev.selectedTask.id]: {
                            ...prev.tasks[prev.selectedTask.id],
                            notes: [
                                ...prev.tasks[prev.selectedTask.id].notes,
                                { note: prev.newNote }
                            ]
                        }
                    },
                    showModal: false,
                    selectedTask: null,
                    newNote: '',
                    file: null
                }));
            });
    };

    handleFileClick = () => {
        this.fileInput.current.click();
    }

    handleFileChange = (e) => {
        this.setState({
            file: e.target.files[0]
        });
    }
    deleteNote = (id) => {
        axios
            .delete(`${API_BASE_URL}/work_ledgerr/kanbanBoard.php`, {
                data: { id }
            })
            .then(() => {
                this.fetchTasks(this.state.selectedProjectId);
            })
            .catch(() => alert("Delete failed"));
    };
    toggleNoteComplete = (noteId) => {
        const { selectedTask } = this.state;
        if (!selectedTask) return;

        const note =
            selectedTask.notes.find(n => n.id === noteId);

        const newStatus =
            note.completed === 'completed' ? 'pending' : 'completed';

        axios.put(
            `${API_BASE_URL}/work_ledgerr/kanbanBoard.php?note_status=1`,
            {
                id: noteId,
                status: newStatus
            }
        ).then(() => {
            this.setState(prev => ({
                tasks: {
                    ...prev.tasks,
                    [selectedTask.id]: {
                        ...prev.tasks[selectedTask.id],
                        notes: prev.tasks[selectedTask.id].notes.map(n =>
                            n.id === noteId
                                ? { ...n, completed: newStatus }
                                : n
                        )
                    }
                },
                selectedTask: {
                    ...selectedTask,
                    notes: selectedTask.notes.map(n =>
                        n.id === noteId
                            ? { ...n, completed: newStatus }
                            : n
                    )
                }
            }));
        }).catch(() => {
            alert("Status update failed");
        });
    };



    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-2 kanban-sidebar mh-100">
                        <h5 className="fw-bold  mt-4 project-name border-bottom" >Projects List</h5>
                        {this.state.projects.map(p => (
                            <div
                                key={p.project_id}
                                className={`project-item ${this.state.selectedProjectId === p.project_id
                                    ? 'active'
                                    : ''
                                    }`}
                                onClick={() => this.selectProject(p)}
                            >
                                {p.project_name}
                            </div>
                        ))}
                    </div>
                    <div className="col-lg-10 mt-4">
                        <DragDropContext onDragEnd={this.onDragEnd}>
                            <div className="row ms-1 drag-column">
                                {this.state.columnOrder.map(colId => {
                                    const column = this.state.columns[colId];
                                    const tasks = column.taskIds.map(
                                        id => this.state.tasks[id]
                                    );

                                    return (
                                        <Column
                                            key={colId}
                                            column={column}
                                            tasks={tasks}
                                            openModal={this.openModal}
                                        />
                                    );
                                })}
                            </div>
                        </DragDropContext>
                    </div>
                </div>

                {this.state.showModal && (
                    <Modal
                        task={this.state.selectedTask}
                        newNote={this.state.newNote}
                        onChange={e => this.setState({ newNote: e.target.value })}
                        onClose={this.closeModal}
                        onSubmit={this.submitNote}
                        handleFileClick={this.handleFileClick}
                        handleFileChange={this.handleFileChange}
                        fileInput={this.fileInput}
                        file={this.state.file}
                        toggleNoteComplete={this.toggleNoteComplete}
                        deleteNote={this.deleteNote}
                    />

                )}
            </div>
        );
    }
}

const Column = ({ column, tasks, openModal }) => (
    <div className="col-lg-3">
        <div className="kanban-header">{column.title}</div>

        <Droppable droppableId={column.id}>
            {p => (
                <div ref={p.innerRef} {...p.droppableProps} className="kanban-column">
                    {tasks.map((task, index) => (
                        <Task
                            key={task.id}
                            task={task}
                            index={index}
                            onClick={openModal}
                        />
                    ))}
                    {p.placeholder}
                </div>
            )}
        </Droppable>
    </div>
);

const Task = ({ task, index, onClick }) => {
    const isCompleted =
        task.notes.length > 0 &&
        task.notes.every(n => n.completed === 'completed');

    return (
        <Draggable draggableId={task.id} index={index}>
            {p => (
                <div
                    ref={p.innerRef}
                    {...p.draggableProps}
                    {...p.dragHandleProps}
                    className="kanban-card"
                    onClick={() => onClick(task)}
                >
                    <div className="card-title">{task.title}</div>

                    <div className="card-meta mt-2">
                        <span>👤 {task.user}</span>
                        <span>📅 {task.dueDate}</span>
                    </div>

                    <div
                        className="mt-3"
                        style={{ opacity: isCompleted ? 0.5 : 1 }}
                    >
                        <strong>Sub Task:</strong>

                        {task.notes.map((n, i) => (
                            <div
                                key={i}
                                className={
                                    n.completed === 'completed'
                                        ? 'text-decoration-line-through text-muted'
                                        : ''
                                }
                            >
                                📝 {n.note}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Draggable>
    );
};


const Modal = ({ task, newNote, onChange, onClose, handleFileClick, deleteNote, toggleNoteComplete, handleFileChange, fileInput, file, onSubmit }) => (
    <div className="modal-backdrop">
        <div className="modal-box">
            <form onSubmit={onSubmit}>
                <h5>{task.title}</h5>

                <label className='fw-bold'>Existing Sub Tasks</label>
                <div className="mb-2">
                    {/* {task.notes.length === 0 && (
                        <div className="text-muted">No Tasks yet</div>
                    )} */}
                    <ul className="list-unstyled">
                        {task.notes.map(n => (
                            <li
                                key={n.id}
                               
                            >
                                <div  className={`d-flex justify-content-between align-items-center mt-2 
                                          ${n.completed === 'completed'
                                        ? 'text-decoration-line-through text-muted'
                                        : ''}`}>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-success me-2"
                                        disabled={n.completed === 'completed'}
                                        onClick={() => toggleNoteComplete(n.id)}
                                    >
                                        <i className="bi bi-check-lg"></i>
                                    </button>

                                    <span style={{
                                        pointerEvents: n.completed === 'completed' ? 'none' : 'auto'
                                    }}>
                                        📝 {n.note}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    disabled={n.completed === 'completed'}
                                    onClick={() => deleteNote(n.id)}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </li>

                        ))}
                    </ul>

                </div>

                <label className='fw-bold mt-4'>Add New Sub Task</label>
                <textarea
                    value={newNote}
                    onChange={onChange}
                    className="form-control"
                    rows="3"
                    required
                />
                <label htmlFor="">Attachment</label>
                <div>
                    <input
                        type="file"
                        ref={fileInput}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    <span
                        onClick={handleFileClick}
                        className='buttonStyle'
                    >
                        <i className="bi bi-plus-circle"></i>
                    </span>
                    <span style={{ marginLeft: '10px' }}>
                        {file ? file.name : "No file chosen"}
                    </span>
                </div>

                <div className="modal-actions mt-3">
                    <button type="submit" className="save">
                        Submit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
);