To-Do List Web Application –

    This is a full-featured To-Do List application built with Node.js, Express, MongoDB, and EJS. It allows users to manage their daily tasks efficiently while keeping each user’s data private and secure. The app combines user authentication, session management, and dynamic task handling to provide a smooth and interactive experience.

    Key Features and Functionality
    
        User Authentication and Sessions
        
        Users can register with a unique ID, name, and password.
        
        Login is secured with session-based authentication, ensuring that users remain logged in until they log out.
        
        Logout functionality clears the session, preventing unauthorized access.

    Personalized Task Management
    
        Each user has their own task list, stored separately in MongoDB.
        
        Users can add new tasks with descriptions, optional due dates, and priority levels.
        
        Duplicate task names are automatically prevented, ensuring clarity and organization.

    Task Completion and Deletion
    
        Tasks can be marked as completed with a single click.
        
        Users can delete tasks that are no longer relevant.
        
        Completed tasks can also be viewed later in the history section.

    Advanced Task Filtering and Sorting
    
        Tasks can be filtered by completion status.
        
        Tasks can be sorted by priority to focus on important work first.
        
        Tasks can be sorted by due date to manage deadlines effectively.

    Task History Tracking
    
        Users can access a full history of their tasks, including completed ones.
        
        This allows for reviewing past work or tracking productivity over time.

    User-Friendly Interface
    
        The frontend is built using EJS templates, dynamically rendering tasks and user data.
        
        CSS and static assets are served from a dedicated public folder, making the UI responsive and visually clean.

    Database-Driven
    
        MongoDB, via Mongoose, stores users and tasks securely.
        
        Task data is structured as arrays in the database, supporting multiple tasks per user and efficient querying.

Workflow Overview

    A new user registers and is added to the MongoDB database.
    
    The user logs in, starting a session to track authenticated requests.
    
    The user can add, view, filter, sort, complete, and delete tasks on the home page.
    
    Completed tasks can be reviewed in the history section for record-keeping.
    
    Logging out ends the session, requiring the user to log in again to access tasks.

Technology Stack

    Backend: Node.js, Express.js
    
    Database: MongoDB with Mongoose
    
    Frontend: EJS templates, HTML, CSS
    
    Session Handling: express-session
    
    Environment Variables: dotenv
